var noble = require("noble");

var TICKR_UUID = process.env.TICKR_UUID;
var allowDuplicates = false;
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml
var HR_CHARACTERISTIC_HEARTRATE_UUID = "2a37";
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml&u=org.bluetooth.service.heart_rate.xml
var HEART_RATE_SERVICE_UUID = "180d";
var fs = require('fs');
var startTime = new Date();
var averageHeartRate, prevAverageHeartRate;
var AUDIO_CUE_PERIOD = process.env.AUDIO_CUE_PERIOD || 60;
var lastPeriodHeartRates = [];

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
              var heartRate = data.readUInt8(1);
              var timestamp = Math.floor((new Date() - startTime) / 1000);
              console.log(timestamp + ": " + heartRate);

              lastPeriodHeartRates.push(heartRate);
              logHeartRate(heartRate, timestamp);

              if(timestamp % AUDIO_CUE_PERIOD === 0) {
                audioCue();
              }
            });
          });
        }
      });
    });
  }
});

function audioCue() {
  var averageHeartRate = lastPeriodHeartRates.reduce(function(p,c,i,a){return p + (c/a.length)},0).toFixed();

  lastPeriodHeartRates = [];

  if(prevAverageHeartRate) {
    var relativeChange = (averageHeartRate - prevAverageHeartRate) * 100 / averageHeartRate;
    relativeChange = relativeChange.toFixed();

    if(relativeChange > 0) {
      runCmd("say pulse got higher by " + Math.abs(relativeChange) + " percent and now is " + averageHeartRate);
    } else if(relativeChange < 0) {
      runCmd("say pulse got lower by " + Math.abs(relativeChange) + " percent and now is " + averageHeartRate);
    } else {
      runCmd("say pulse is same and now is " + averageHeartRate);
    }
  } else {
    prevAverageHeartRate = averageHeartRate;
  }
}

function logHeartRate(heartRate, timestamp) {
  var dataRow = timestamp + ";" + heartRate + "\n";

  fs.appendFile("hr_log.txt", dataRow, function (error) {
    if (error) {
      console.log(error);
    }
  });
}

function runCmd(cmd) {
  require('child_process').execSync(cmd, function puts(error, stdout, stderr) {
  });
}

function exitHandler(err) {
  runCmd("say shutting down");

  if(err) {
    console.log(err);
  }

  process.exit();
}

process.on('SIGINT', exitHandler);
process.on('uncaughtException', exitHandler);
