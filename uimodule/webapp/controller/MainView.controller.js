sap.ui.define(
    [ "com/YPF/mapApp/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "com/YPF/mapApp/model/Constants",
      "com/YPF/mapApp/model/Services",
      "com/YPF/mapApp/model/Formatter"
    ],
    function (Controller, JSONModel, Constants, Services) {
        "use strict";
        return Controller.extend("com.YPF.mapApp.controller.MainView", {
            onInit: async function(){
                this.loadRoutesModel();
            },
            loadRoutesModel: async function(){
                const oResponse = await Services.getLocalJSON(
                    Constants.jsons.ROUTES_JSON_PATH
                );
                const oDataRoutes = oResponse[0];
                let oModelRoutes = new JSONModel();
                oModelRoutes.setData(oDataRoutes);
                this.getView().setModel(oModelRoutes, Constants.paths.ROUTES_PATH);
            },
            onPressGoToRouteDetail: function(oEvent){
                let oItem = oEvent.getSource();
                let oBindingContexts = oItem
                .getBindingContext(Constants.paths.ROUTES_PATH)
                .getPath();
                let oRoute = this.getView()
                .getModel(Constants.paths.ROUTES_PATH)
                .getProperty(oBindingContexts);
                var oRouteModel = new JSONModel();
                oRouteModel.setData(oRoute);
                this.getOwnerComponent().setModel(
                oRouteModel,
                Constants.paths.ROUTE_PATH
                );
                this.navTo(Constants.targets.ROUTE_DETAIL);
            },
            onPressCreate: function(){
                
            },
            onFilterRoutes: function(oEvent){

            }
        });
    }
);