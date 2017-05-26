var noble = require("noble");

var TICKR_UUID = process.env.TICKR_UUID;
var allowDuplicates = false;
var HEART_RATE_SERVICE_UUID = "180d";

noble.on("stateChange", function(state) {
  if (state === "poweredOn") {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", function (peripheral) {
  if(peripheral.uuid === TICKR_UUID) {
    peripheral.connect(function(error) {
      peripheral.discoverServices([
        HEART_RATE_SERVICE_UUID
      ], function(error, services) {
        if(error) {
          console.log("--> error: " + error);
        }

        var service = services.find(function(el) {
          return el.uuid = HEART_RATE_SERVICE_UUID;
        });

        if(service) {
          console.log(service);
        }
      });
    });
  }
});


