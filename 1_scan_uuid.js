var noble = require("noble");

var printDeviceInfo = function (peripheral) {
  var advertisement = peripheral.advertisement;

  console.log("UUID: " + peripheral.uuid);
  console.log("Local Name: " + advertisement.localName);
  console.log("Service Data: " + advertisement.serviceData);
  console.log("Service UUIDs: " + advertisement.serviceUuids);
};

noble.on("stateChange", function(state) {
  if (state === "poweredOn") {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", function (peripheral) {
  printDeviceInfo(peripheral);
});
