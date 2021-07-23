sap.ui.define(
    [
        "com/YPF/mapApp/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "com/YPF/mapApp/model/Constants",
        "com/YPF/mapApp/model/Services",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/ui/Device",
        "sap/ui/model/Sorter",
        "sap/m/MessageToast",
	    "sap/m/MessageBox"
    ],
    function (Controller, JSONModel, Constants, Services, Filter, FilterOperator, Fragment, Device, Sorter, MessageToast, MessageBox) {
        "use strict";
        return Controller.extend("com.YPF.mapApp.controller.MainView", {
            onInit: async function(){
                this.loadRoutesModel();
                this._mViewSettingsDialogs = {};
                var oModel = new JSONModel();
                this.getView().setModel(oModel);
                this.getView().setModel(oModel, "newRouteModel");
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
            onFilterRoutes: function(oEvent){
                let oFilter;
                let sQuery = oEvent.getSource().getValue();
                let sPath = "ROU_ID"; //SIN DROPDOWN
                // let sPath = this.getView().getModel("utilsModel").getData().UTSHeaderFilter; con dropdown

                if (sQuery && sQuery.length > 0) {
                oFilter = new Filter(sPath, FilterOperator.Contains, sQuery);
                };

                // Actualizamos los bindings de la tabla
                var oTable = this.byId("routesTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(oFilter, "Application");
            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
                if (!pDialog) {
                  pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                  }).then(function (oDialog) {
                    if (Device.system.desktop) {
                      oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                  });
                  this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },
            onSortRoutesButtonPressed: function(){
                this.getViewSettingsDialog("com.YPF.mapApp.fragment.RouteSortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            onSortRoutesConfirm: function(oEvent){
                let oTable = this.byId("routesTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },
            onAdd: function(){
                this.navTo(Constants.targets.CREATE_ROUTE);
            },
        });
    }
);