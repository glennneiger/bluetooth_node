var noble = require("noble");

var TICKR_UUID = process.env.TICKR_UUID;
var allowDuplicates = false;
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml
var HR_CHARACTERISTIC_HEARTRATE_UUID = "2a37";
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml&u=org.bluetooth.service.heart_rate.xml
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
          service.discoverCharacteristics([
            HR_CHARACTERISTIC_HEARTRATE_UUID
          ], function(error, characteristics) {
            if (error) {
              console.log("--> error: " + error);
            }

            var heartRateCharacteristic = characteristics.find(function(el) {
              return el.uuid = HR_CHARACTERISTIC_HEARTRATE_UUID;
            });

            heartRateCharacteristic.subscribe(function(error) {
              if (error) {
                console.log("--> subscribe error: " + error);
              }
            });

            heartRateCharacteristic.on("data", function(data, isNotification) {
              console.log(data.readUInt8(1));
            });
          });
        }
      });
    });
  }
});
