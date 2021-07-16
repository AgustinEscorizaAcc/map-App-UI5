sap.ui.define([], function () {
    "use strict";
    return {
        formatRouteStatusToText: function (Status) {
            let returnStatus;
            if (Status == "0") {
              returnStatus = "Entregado";
            } else if (Status == "1") {
              returnStatus = "En Camino";
            } else {
              returnStatus = "Cancelado";
            }
            return returnStatus;
        },
        formatRouteStatusToState: function(Status){
            let returnState;
            if (Status == "0") {
                returnState = "Success";
              } else if (Status == "1") {
                returnState = "Warning";
              } else {
                returnState = "Error";
              }
              return returnState;
        },
        formatVehicleStatusToText: function (Status) {
          let returnStatus;
          if (Status == "0") {
            returnStatus = "Disponible";
          } else if (Status == "1") {
            returnStatus = "No disponible";
          }
          return returnStatus;
        },
        formatVehicleStatusToState: function(Status){
          let returnState;
          if (Status == "0") {
              returnState = "Success";
            } else if (Status == "1") {
              returnState = "Warning";
            }
            return returnState;
        },
    };
});
