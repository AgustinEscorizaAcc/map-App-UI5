sap.ui.define(
    [
        "com/YPF/mapApp/controller/BaseController",
        "sap/m/MessageToast",
	    "sap/m/MessageBox",
        "sap/ui/model/json/JSONModel",
        "com/YPF/mapApp/model/Constants",
        "com/YPF/mapApp/model/Services",
        "sap/base/util/uid"
    ],
    function(Controller, MessageToast, MessageBox, JSONModel, Constants, Services, uid){
        "use strict";

        return Controller.extend("com.YPF.mapApp.controller.CreateRoute", {
            onInit: function(){
                this._oWizard = this.byId("CreateRouteWizard");
                const myRoute = this.getOwnerComponent().getRouter().getRoute(Constants.targets.CREATE_ROUTE);
                myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
                this.markers = [];
                var oModel = new JSONModel();
                let oEmptyModel = {
                    VEHICLE: {
                        VEH_ID: "",
                        VEH_BRAND: "",
                        VEH_MODEL: "",
                        VEH_TYPE: "",
                        VEH_PATENT: ""
                    },
                    DRIVER: {
                        DRI_ID: "",
                        DRI_NAME: "",
                        DRI_LASTNAME: "",
                        DRI_EMAIL: "",
                        DRI_PHONE: ""
                    },
                    SHIPMENT: {
                        SHP_ID: "",
                        SHP_TYPE: "",
                        SHP_MATERIAL: "",
                        SHP_AMOUNT: ""
                    }
                };
                this.getView().setModel(oModel);
                this.getView().setModel(oModel, "GDATA");
                this.getView().setModel(oModel, "inputRoute");
                oModel.setData(oEmptyModel);
                this.getView().setModel(oModel, "newRouteModel");
                this.handleButtonsVisibility();
                this.validRoute = false; // chequear cuando haga el next que se pueda dibujar
            },
            onMyRoutePatternMatched: function(){
                this.initWizardMap();
            },
            onAfterRendering: function(){
                this.handleButtonsVisibility();
                this.initWizardMap();
            },
            onDialogNextButton: function(){
                //en caso de necesitar validacion en caso especifico puede ir aca: this._oWizard.getProgressStep() === 1 o algo asi
                if (this._oWizard.getProgressStep().getValidated() && this.validRoute === true) {
                    this.initializedMap = undefined;
                    this._oWizard.nextStep();
                } else {
                    MessageToast.show("Las direcciones no son validas o la ruta no fue marcada");
                }
                this.handleButtonsVisibility();
            },
            onDialogBackButton: function () {
                if (this._oWizard.getProgressStep() == this._oWizard.getSteps()[1]){
                    this.validRoute = false;
                    this.initWizardMap();
                }
                this._oWizard.previousStep();
                this.handleButtonsVisibility();
            },
            onDrawRoute: function(){
                let that = this;
                var directionsRenderer = new google.maps.DirectionsRenderer({
                    map: this.map
                  });
                  var directionsService = new google.maps.DirectionsService;
                  let oOrigin = this.byId("origen").getValue();
                  let oDestination = this.byId("destino").getValue();
                  var req = {
                    origin: oOrigin,
                    destination: oDestination,
                    travelMode: 'DRIVING'
                  };
                  directionsService.route(req, function(response, status) {
                    if (status === 'OK') {
                        that.validRoute = true;
                        directionsRenderer.setDirections(response);
                    } else {
                        that.validRoute = false;
                        MessageToast.show( "Esa ruta no es posible");
                    }
                  });
            },
            handleButtonsVisibility: function () {
                var oModel = this.getView().getModel();
                switch (this._oWizard.getProgress()){
                    case 1:
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/nextButtonEnabled", true);
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/reviewButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        break;
                    case 2:
                        oModel.setProperty("/backButtonVisible", true);
                        break;
                    case 3:
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/reviewButtonVisible", false);
                        break;
                    case 4:
                        oModel.setProperty("/nextButtonVisible", false);
                        oModel.setProperty("/reviewButtonVisible", true);
                        oModel.setProperty("/finishButtonVisible", false);
                        break;
                    case 5:
                        oModel.setProperty("/finishButtonVisible", true);
                        oModel.setProperty("/backButtonVisible", true);
                        oModel.setProperty("/reviewButtonVisible", false);
                        break;
                    default: break;
                }
            },
            _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
                MessageBox[sMessageBoxType](sMessage, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                            this.navTo(Constants.targets.MAIN_VIEW);
                        }
                    }.bind(this)
                });
            },
            handleWizardCancel: function () {
                this._handleMessageBoxOpen("Are you sure you want to cancel your report?", "warning");
            },
            handleWizardSubmit: function () {
                this._handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
            },
            initWizardMap: function(){
                let that = this;
                this.vDataCheck = false;
                if (!this.initializedMap) {
                  this.initializedMap = true;
                  this.geocoder = new google.maps.Geocoder();
                  window.mapOptions = {
                    center: new google.maps.LatLng(-34.6337368, -58.4150561),
                    zoom: 8,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };
                  //------Creo el objeto mapa------//
                  let map;
                   window.setTimeout(function(){
                      map = new google.maps.Map(
                      that.getView().byId("id_GMapContainer").getDomRef(),
                      mapOptions
                    );
                    that.map = map;
                    const centerControlDiv = document.createElement("div");
                    that.centerControl(centerControlDiv);
                    that.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);
                    let infowindow = new google.maps.InfoWindow();
                    let geocoder = new google.maps.Geocoder();
                    //------------------ llamo a la funcion de crear marcador-----------//
                    that.fnGMapMarkerCreateOnClick(map, geocoder, infowindow);
                  }, 1000);
                } else {
                }
            },
            fnGMapMarkerCreateOnClick: function (map, geocoder, infowindow) {
                let that = this;
                google.maps.event.addListener(map, "click", function (e) {
                  let lolatitude = e.latLng.lat(); //calcula latitud del onclick
                  let lolongitude = e.latLng.lng(); //calcula longitud
                  (that.vGLat = lolatitude), (that.vGLang = lolongitude);
                  let latlng = new google.maps.LatLng(
                    "latlng",
                    lolatitude,
                    lolongitude
                  );
                  let textlat = new sap.m.Text({ text: lolatitude });
                  let textlng = new sap.m.Text({ text: lolongitude });
                  (window.point1 = lolatitude), (window.point2 = lolongitude);
                  geocodeLatLng(geocoder, map, infowindow, textlat, textlng, e);
                });
                function geocodeLatLng(geocoder, map, infowindow, textlat, textlng, e) {
                  let inputLat = textlat.mProperties.text,
                    inputLng = textlng.mProperties.text;
                  let latlng = { lat: parseFloat(inputLat), lng: parseFloat(inputLng) };
                  geocoder.geocode({ location: latlng }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                      if (results[0]) {
                        let marker = new google.maps.Marker({
                          position: results[0].geometry.location,
                          map: map,
                          id: uid()
                        });
                        that.markers.push(marker);
                        // Mouse click event para el marcador
                        google.maps.event.addListener(marker, "click", function (e) {
                          window.setTimeout(function(){
                            that.fnOnClickPlace(e);
                          }, 100);
                        });
                        google.maps.event.addListener(marker, "rightclick", async function (oEvent) {
                          let oMarker = await that.markers.find((iterableMarker)=>
                          {
                            if (iterableMarker.internalPosition === oEvent.latLng) {
                              return iterableMarker;
                            } else {
                              return null;
                            }
                          });
                          if (oMarker != null){
                            oMarker.setMap(null);
                          };
                        });
                      } else {
                        window.alert("No results found");
                      }
                    } else {
                      window.alert("Geocoder failed due to" + status);
                    }
                  });
                }
            },
            centerControl: function(controlDiv){
                // Set CSS for the control border.
                const controlUI = document.createElement("div");
                controlUI.style.backgroundColor = "#fff";
                controlUI.style.border = "2px solid #fff";
                controlUI.style.borderRadius = "3px";
                controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
                controlUI.style.cursor = "pointer";
                controlUI.style.marginTop = "8px";
                controlUI.style.marginBottom = "22px";
                controlUI.style.textAlign = "center";
                controlUI.title = "Click to recenter the map";
                controlDiv.appendChild(controlUI);
                // Set CSS for the control interior.
                const controlText = document.createElement("div");
                controlText.style.color = "rgb(25,25,25)";
                controlText.style.fontFamily = "Roboto,Arial,sans-serif";
                controlText.style.fontSize = "16px";
                controlText.style.lineHeight = "38px";
                controlText.style.paddingLeft = "5px";
                controlText.style.paddingRight = "5px";
                controlText.innerHTML = "Remove All Markers";
                controlUI.appendChild(controlText);
                // Setup the click event listeners: simply set the map to Chicago.
                controlUI.addEventListener("click", () => {
                  for ( let marker of this.markers){
                    marker.setMap(null);
                  }
                  this.markers = [];
                });
              },
              fnOnClickPlace: function (e) {
                let oView = this.getView();
                this.vDataCheck = false;
                //let oInput = oView.byId("placeInput"); // no es un boton como el del ejemplo
                let lolatitude = e.latLng.lat(),
                  lolongitude = e.latLng.lng();
                (this.vGLat = lolatitude), (this.vGLang = lolongitude);
                if (!this._PopDialog) {
                  this._PopDialog = sap.ui.xmlfragment(
                    "com.YPF.mapApp.fragment.MapPopUp",
                    this
                  );
                  oView.addDependent(this._PopDialog);
                }
                this._PopDialog.openBy(e.domEvent.toElement);
                if (this.getView().getModel("GDATA").getData()) {
                    let vGDJSONLen = this.getView().getModel("GDATA").getData().length;
                    for (let i = 0; i < vGDJSONLen; i++) {
                        if (
                        Number(this.getView().getModel("GDATA").getData()[i].Lat) ==
                            Number(that.vGLat) &&
                        Number(this.getView().getModel("GDATA").getData()[i].Lang) ==
                            Number(that.vGLang)
                        ) {
                        sap.ui
                            .getCore()
                            .byId("id_IPGridNo")
                            .setValue(this.getView().getModel("GDATA").getData()[i].Grid);
                        sap.ui
                            .getCore()
                            .byId("id_IPProjID")
                            .setValue(
                            this.getView().getModel("GDATA").getData()[i].Project
                            );
                        ( that.vDataCheck = true), (that.vGDMatIndex = 1);
                        break;
                        } else {
                        that.vDataCheck = false;
                        }
                    }
                } else {
                that.vDataCheck = false;
                }
                if (!this.vDataCheck) {
                sap.ui.getCore().byId("id_IPGridNo").setValue("");
                sap.ui.getCore().byId("id_IPProjID").setValue("");
                }
            },
            fnSave: function(){
                if (sap.ui.getCore().byId("id_IPGridNo").getValue() && sap.ui.getCore().byId("id_IPProjID").getValue()){
                    let oData = {
                        "Grid": sap.ui.getCore().byId("id_IPGridNo").getValue(),
                        "Project": sap.ui.getCore().byId("id_IPProjID").getValue(),
                        "Lat": this.vGLat,
                        "Lang": this.vGLang
                    };
                    this.fnDataProcess(oData);
                    sap.ui.getCore().byId("id_IPGridNo").setValue("");
                    sap.ui.getCore().byId("id_IPProjID").setValue("");
                    this._PopDialog.close();
                } else { MessageToast.show( "Por favor Ingrese valores para guardar"); }
            },
            fnCancel: function(){
                this._PopDialog.close();
            },
        });
    }
)