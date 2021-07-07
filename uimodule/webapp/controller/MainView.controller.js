sap.ui.define(
  [ "com/YPF/mapApp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"],
  function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.YPF.mapApp.controller.MainView", {
      onInit: function () {
          this.vDataCheck = false;
          this.vGLat = null;
          this.vGLang = null;
          this.vGDMatIndex = 0; //Ojo
          // this.getGDATA(); si se pudiera cargar un JSON con ajax aca puedo traer markers guardados, y guardarlos cuando se crean 
          let oGoogleModel = new JSONModel([]);
          this.getView().setModel(oGoogleModel, "GDATA");
      },
      onAfterRendering: function () {
        this.vDataCheck = false;
        if (!this.initialized) {
          this.initialized = true;
          this.geocoder = new google.maps.Geocoder();

          window.mapOptions = {
            center: new google.maps.LatLng(-34.6337368, -58.4150561),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          //------Creo el objeto mapa------//
          let map = new google.maps.Map(
            this.getView().byId("id_GMapContainer").getDomRef(),
            mapOptions
          );
          let infowindow = new google.maps.InfoWindow();
          let geocoder = new google.maps.Geocoder();
          let marker = new google.maps.Marker({
            map: map,
          });
          //------------------ llamo a la funcion de crear marcador-----------//
          this.fnGMapMarkerCreateOnClick(map, geocoder, infowindow);
        } else if (this.initialized === true) {
          this.fnSearch();
        }
      },
      fnGMapMarkerCreateOnClick: function (map, geocoder, infowindow) {
        let that = this;
        google.maps.event.addListener(map, "click", function (e) {
          let lolatitude = e.latLng.lat(); //calcula latitud del onclick
          let lolongitude = e.latLng.lng(); //calcula longitud
          (this.vGLat = lolatitude), (this.vGLang = lolongitude);
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
                });

                // Mouse click event para el marcador
                google.maps.event.addListener(marker, "click", function (e) {
                  window.setTimeout(function(){
                    that.fnOnClickPlace(e);
                  }, 100);
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
      fnOnClickPlace: function (e) {
        let that = this;
        let oView = this.getView();
        this.vDataCheck = false;
        let oInput = oView.byId("placeInput"); // no es un boton como el del ejemplo
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
        //let vSelMarkerId = e.tb.path[1].getAttribute("id");
        // this._PopDialog.openBy(document.getElementById(vSelMarkerId));
        // this._PopDialog.openBy(e.domEvent.screenX,e.domEvent.screenY);
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
      fnDataProcess: function (oData){
          let oView = this.getView();
          if (this.vDataCheck){
              this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Grid = oData[0].Grid;
              this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Project = oData[0].Project;
            //   this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Lat = oData[0].Lat;   Mepa que estas entran en el else
            //   this.getView().getModel("GDATA").getData()[this.vGDMatIndex].Lang = oData[0].Lang;
              this.getView().getModel("GDATA").getData().refresh();
          } else {
              this.getView().getModel("GDATA").getData().push(oData);
              this.getView().getModel("GDATA").refresh();
          }
      },
      fnSearch: function(){
          let that = this;
          let newMap = new google.maps.Map(this.getView().byId("id_GMapContainer").getDomRef(), mapOptions);
          let address = this.getView().byId("placeInput").getValue();
          this.geocoder.geocode( {'address': address }, function(results,status){
              if (status == google.maps.GeocoderStatus.OK){
                newMap.setCenter(results[0].geometry.location);
                let infowindow = new google.maps.InfoWindow;
                let geocoder = new google.maps.Geocoder();
                let marker = new google.maps.Marker({
                    map: newMap,
                    position: results[0].geometry.location
                });
                that.fnGMapMarkerCreateOnClick(newMap, geocoder, infowindow); // this me devolvia undefined por eso that(wtf)

                google.maps.event.addListener(marker, "click", function (e){
                    window.setTimeout(function(){
                      that.fnOnClickPlace(e);
                    }, 100);
                });
              } else { alert("GeoCode fallo por la siguiente razon: " + status)};
          });
          return;
      }
    });
  }
);
