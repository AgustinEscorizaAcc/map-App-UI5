sap.ui.define(
  [ "com/YPF/mapApp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/uid",
    "com/YPF/mapApp/model/Constants",
    "sap/ui/core/Fragment",
    "sap/uxap/BlockBase"
  ],
  function (Controller, MessageToast, JSONModel, uid, Constants, Fragment, BlockBase) {
    "use strict";

    return Controller.extend("com.YPF.mapApp.controller.RouteDetail", {
      onInit: function () {
        this.loadRouteModel();
        this.directionsRenderer = null;
        var oRouter = this.getRouter();
			  oRouter.getRoute(Constants.targets.ROUTE_DETAIL).attachMatched(this._onRouteMatched, this);
        this.vDataCheck = false;
        this.vGLat = null;
        this.vGLang = null;
        this.vGDMatIndex = 0; //Ojo
        this.markers = [];
        // this.getGDATA(); si se pudiera cargar un JSON con ajax aca puedo traer markers guardados, y guardarlos cuando se crean
        let oGoogleModel = new JSONModel([]);
        this.getView().setModel(oGoogleModel, "GDATA");
        var BlockPanel = BlockBase.extend("sap.uxap.sample.ObjectPageSubSectionSized.blocks.BlockPanel", {
          metadata: {
              /* no additional views provided */
          }
      });
      return BlockPanel;
      },
      _onRouteMatched: function(){
        this.loadRouteModel();
        let oFrom = this.getView().getModel(Constants.paths.ROUTE_PATH).getProperty("/LOCATION_FROM");
        let oTo = this.getView().getModel(Constants.paths.ROUTE_PATH).getProperty("/LOCATION_TO");
        this.showRoute(oFrom.LO_CITY.concat(oFrom.LO_STATE),oTo.LO_CITY.concat(oTo.LO_STATE));
      },
      loadRouteModel: function(){
        let oModelRoute = this.getOwnerComponent().getModel(
          Constants.paths.ROUTE_PATH
        );
        this.getView().setModel(oModelRoute, Constants.paths.ROUTE_PATH);
      },
      onNavToEdit: function(){
        let oModel = this.getView().getModel("RouteModel");
        let oRoute = {
          Origen: oModel.getData().LOCATION_FROM.LO_CITY,
          Destination: oModel.getData().LOCATION_TO.LO_CITY
        };
        let oRouteModel = new JSONModel();
        oRouteModel.setData(oRoute);
        this.getOwnerComponent().setModel(oModel, "addRouteModel");
        this.getOwnerComponent().setModel(oRouteModel, "inputRoute");
        this.navTo(Constants.targets.CREATE_ROUTE);
      },
      onAfterRendering: function (){
        let that = this;
        this.vDataCheck = false;
        if (!this.initialized) {
          this.initialized = true;
          let oFrom = this.getView().getModel(Constants.paths.ROUTE_PATH).getProperty("/LOCATION_FROM");
          let oTo = this.getView().getModel(Constants.paths.ROUTE_PATH).getProperty("/LOCATION_TO");
          this.geocoder = new google.maps.Geocoder();
          window.mapOptions = {
            center: new google.maps.LatLng(-34.6337368, -58.4150561),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          this.mapHtmlRef = this.getView().byId("id_GMapContainer").getDomRef();
          //------Creo el objeto mapa------//
          let map;
           window.setTimeout(function(){
              map = new google.maps.Map(
              that.getView().byId("id_GMapContainer").getDomRef(),
              mapOptions
            );
            that.map = map;
            let infowindow = new google.maps.InfoWindow();
            let geocoder = new google.maps.Geocoder();
            that.showRoute(oFrom.LO_CITY.concat(oFrom.LO_STATE),oTo.LO_CITY.concat(oTo.LO_STATE));
          }, 1000);
        }
      },
      showRoute: function(oOrigin, oDestination){
        let that = this;
        if (this.directionsRenderer != null){
          this.directionsRenderer.setMap(null);
          this.directionsRenderer = null;
        }
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(this.map);
        var directionsService = new google.maps.DirectionsService;
        var req = {
          origin: oOrigin,
          destination: oDestination,
          travelMode: 'DRIVING'
        };
        directionsService.route(req, function(response, status) {
          if (status === 'OK') {
            that.directionsRenderer.setDirections(response);
          } else {
            MessageToast.show( "Esa ruta no es posible");
          }
        });
      },
    //    DE ACA PARA ABAJO, FUNCIONES DE MAPA QUE AL FINAL SE PASARON A LA OTRA VISTA
    //   fnGMapMarkerCreateOnClick: function (map, geocoder, infowindow) {
    //     let that = this;
    //     google.maps.event.addListener(map, "click", function (e) {
    //       let lolatitude = e.latLng.lat(); //calcula latitud del onclick
    //       let lolongitude = e.latLng.lng(); //calcula longitud
    //       (that.vGLat = lolatitude), (that.vGLang = lolongitude);
    //       let latlng = new google.maps.LatLng(
    //         "latlng",
    //         lolatitude,
    //         lolongitude
    //       );
    //       let textlat = new sap.m.Text({ text: lolatitude });
    //       let textlng = new sap.m.Text({ text: lolongitude });
    //       (window.point1 = lolatitude), (window.point2 = lolongitude);
    //       geocodeLatLng(geocoder, map, infowindow, textlat, textlng, e);
    //     });

    //     function geocodeLatLng(geocoder, map, infowindow, textlat, textlng, e) {
    //       let inputLat = textlat.mProperties.text,
    //         inputLng = textlng.mProperties.text;
    //       let latlng = { lat: parseFloat(inputLat), lng: parseFloat(inputLng) };
    //       geocoder.geocode({ location: latlng }, function (results, status) {
    //         if (status === google.maps.GeocoderStatus.OK) {
    //           if (results[0]) {
    //             let marker = new google.maps.Marker({
    //               position: results[0].geometry.location,
    //               map: map,
    //               id: uid()
    //             });
    //             that.markers.push(marker);
    //             // Mouse click event para el marcador
    //             google.maps.event.addListener(marker, "click", function (e) {
    //               window.setTimeout(function(){
    //                 that.fnOnClickPlace(e);
    //               }, 100);
    //             });
    //             google.maps.event.addListener(marker, "rightclick", async function (oEvent) {
    //               let oMarker = await that.markers.find((iterableMarker)=>
    //               {
    //                 if (iterableMarker.internalPosition === oEvent.latLng) {
    //                   return iterableMarker;
    //                 } else {
    //                   return null;
    //                 }
    //               });
    //               if (oMarker != null){
    //                 oMarker.setMap(null);
    //               };
    //             });
    //           } else {
    //             window.alert("No results found");
    //           }
    //         } else {
    //           window.alert("Geocoder failed due to" + status);
    //         }
    //       });
    //     }
    //   },
    //   centerControl: function(controlDiv){
    //     // Set CSS for the control border.
    //     const controlUI = document.createElement("div");
    //     controlUI.style.backgroundColor = "#fff";
    //     controlUI.style.border = "2px solid #fff";
    //     controlUI.style.borderRadius = "3px";
    //     controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    //     controlUI.style.cursor = "pointer";
    //     controlUI.style.marginTop = "8px";
    //     controlUI.style.marginBottom = "22px";
    //     controlUI.style.textAlign = "center";
    //     controlUI.title = "Click to recenter the map";
    //     controlDiv.appendChild(controlUI);
    //     // Set CSS for the control interior.
    //     const controlText = document.createElement("div");
    //     controlText.style.color = "rgb(25,25,25)";
    //     controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    //     controlText.style.fontSize = "16px";
    //     controlText.style.lineHeight = "38px";
    //     controlText.style.paddingLeft = "5px";
    //     controlText.style.paddingRight = "5px";
    //     controlText.innerHTML = "Remove All Markers";
    //     controlUI.appendChild(controlText);
    //     // Setup the click event listeners: simply set the map to Chicago.
    //     controlUI.addEventListener("click", () => {
    //       for ( let marker of this.markers){
    //         marker.setMap(null);
    //       }
    //       this.markers = [];
    //     });
    //   },
    //   fnOnClickPlace: function (e) {
    //     let that = this;
    //     let oView = this.getView();
    //     this.vDataCheck = false;
    //     //let oInput = oView.byId("placeInput"); // no es un boton como el del ejemplo
    //     let lolatitude = e.latLng.lat(),
    //       lolongitude = e.latLng.lng();
    //     (this.vGLat = lolatitude), (this.vGLang = lolongitude);
    //     if (!this._PopDialog) {
    //       this._PopDialog = sap.ui.xmlfragment(
    //         "com.YPF.mapApp.fragment.MapPopUp",
    //         this
    //       );
    //       oView.addDependent(this._PopDialog);
    //     }
    //     //let vSelMarkerId = e.tb.path[1].getAttribute("id");
    //     // this._PopDialog.openBy(document.getElementById(vSelMarkerId));
    //     // this._PopDialog.openBy(e.domEvent.screenX,e.domEvent.screenY);
    //     this._PopDialog.openBy(e.domEvent.toElement);
    //     if (this.getView().getModel("GDATA").getData()) {
    //       let vGDJSONLen = this.getView().getModel("GDATA").getData().length;
    //       for (let i = 0; i < vGDJSONLen; i++) {
    //         if (
    //           Number(this.getView().getModel("GDATA").getData()[i].Lat) ==
    //             Number(that.vGLat) &&
    //           Number(this.getView().getModel("GDATA").getData()[i].Lang) ==
    //             Number(that.vGLang)
    //         ) {
    //           sap.ui
    //             .getCore()
    //             .byId("id_nombrePuntoGmap")
    //             .setValue(this.getView().getModel("GDATA").getData()[i].Grid);
    //           sap.ui
    //             .getCore()
    //             .byId("id_detallePuntoGmap")
    //             .setValue(
    //               this.getView().getModel("GDATA").getData()[i].Project
    //             );
    //           ( that.vDataCheck = true), (that.vGDMatIndex = 1);
    //           break;
    //         } else {
    //           that.vDataCheck = false;
    //         }
    //       }
    //     } else {
    //       that.vDataCheck = false;
    //     }
    //     if (!this.vDataCheck) {
    //       sap.ui.getCore().byId("id_nombrePuntoGmap").setValue("");
    //       sap.ui.getCore().byId("id_detallePuntoGmap").setValue("");
    //     }
    //   },
    //   fnSave: function(){
    //     if (sap.ui.getCore().byId("id_nombrePuntoGmap").getValue() && sap.ui.getCore().byId("id_detallePuntoGmap").getValue()){
    //         let oData = {
    //             "Grid": sap.ui.getCore().byId("id_nombrePuntoGmap").getValue(),
    //             "Project": sap.ui.getCore().byId("id_detallePuntoGmap").getValue(),
    //             "Lat": this.vGLat,
    //             "Lang": this.vGLang
    //         };
    //         this.fnDataProcess(oData);
    //         sap.ui.getCore().byId("id_nombrePuntoGmap").setValue("");
    //         sap.ui.getCore().byId("id_detallePuntoGmap").setValue("");
    //         this._PopDialog.close();

    //     } else { MessageToast.show( "Por favor Ingrese valores para guardar"); }
    //   },
    //   fnRemoveMarker: function(){
    //     this.markers;
    //     if (this.getView().getModel("GDATA").getData()) {
    //       let vGDJSONLen = this.getView().getModel("GDATA").getData().length;
    //       for (let i = 0; i < vGDJSONLen; i++) {
    //         if (
    //           Number(this.getView().getModel("GDATA").getData()[i].Lat) ==
    //             Number(that.vGLat) &&
    //           Number(this.getView().getModel("GDATA").getData()[i].Lang) ==
    //             Number(that.vGLang)
    //         ) {
    //           sap.ui.getCore().byId("id_nombrePuntoGmap").setValue("");
    //           sap.ui.getCore().byId("id_detallePuntoGmap").setValue("");
    //           break;
    //         }
    //       }
    //     }
    //   },
    //   fnCancel: function(){
    //     this._PopDialog.close();
    //   },
    //   fnDataProcess: function (oData){
    //       if (this.vDataCheck){
    //           this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Grid = oData[0].Grid;
    //           this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Project = oData[0].Project;
    //         //   this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Lat = oData[0].Lat;   Mepa que estas entran en el else
    //         //   this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Lang = oData[0].Lang;
    //           this.getView().getModel("GDATA").getData().refresh();
    //       } else {
    //           this.getView().getModel("GDATA").getData().push(oData);
    //           this.getView().getModel("GDATA").refresh();
    //       }
    //   },
    //   fnSearch: function(oEvent){
    //       let that = this;
    //       let map = this.map;
    //       let address = oEvent.getParameter("value");
    //       this.geocoder.geocode( {'address': address }, function(results, status){
    //           if (status == google.maps.GeocoderStatus.OK){
    //             map.panTo(results[0].geometry.location);
    //             let infowindow = new google.maps.InfoWindow;
    //             let geocoder = new google.maps.Geocoder();
    //             let marker = new google.maps.Marker({
    //                 map: map,
    //                 position: results[0].geometry.location
    //             });
    //             that.markers.push(marker);
    //             google.maps.event.addListener(marker, "click", function (e){
    //                 window.setTimeout(function(){
    //                   that.fnOnClickPlace(e);
    //                 }, 100);
    //             });
    //             google.maps.event.addListener(marker, "rightclick", async function (oEvent) {
    //               let oMarker = await that.markers.find((iterableMarker)=>
    //               {
    //                 if (iterableMarker.internalPosition === oEvent.latLng) {
    //                   return iterableMarker;
    //                 } else {
    //                   return null;
    //                 }
    //               });
    //               if (oMarker != null){
    //                 oMarker.setMap(null);
    //               };
    //             });
    //           } else { alert("GeoCode fallo por la siguiente razon: " + status);};
    //       });
    //       return;
    //   },
    //   onPressDrawRoute: function(oEvent){
    //     var directionsRenderer = new google.maps.DirectionsRenderer({
    //       map: this.map
    //     });
    //     var directionsService = new google.maps.DirectionsService;
    //     let oOrign = oEvent.getSource().getParent().getAggregation("content")[0].getLastValue();
    //     let oDestination = oEvent.getSource().getParent().getAggregation("content")[1].getLastValue();
    //     var req = {
    //       origin: oOrign,
    //       destination: oDestination,
    //       travelMode: 'DRIVING'
    //     };
    //     directionsService.route(req, function(response, status) {
    //       if (status === 'OK') {
    //         directionsRenderer.setDirections(response);
    //       } else {
    //         MessageToast.show( "Esa ruta no es posible");
    //       }
    //     });
    //   }
    });
  }
);
