# Sandbox project to play with Bluetooth pulse sensor.

This is a test project to:

1. Log heart rate during meditation sessions
2. Test audio cues during meditation

## How to use

1. Run `npm install`. [noble](https://github.com/sandeepmistry/noble) is the only dependancy to read heart rate data from Bluetooth sensor
2. Run `node 1_scan_uuid.js` to get UUID of your sensor.
3. Run `TICKR_UUID=uuid AUDIO_CUE_PERIOD=60 node 2_start_session.js` to start session. It'll play audio cues every `AUDIO_CUE_PERIOD` seconds and log heart rate to a file in `session_logs`  folder.

## Check out your last session heart rate report

<img src="https://cloud.githubusercontent.com/assets/768070/26522758/f4d508b8-4307-11e7-8764-ce1392c8e8d1.png" width="600px" alt="Heart rate vs time using Node.js and Bluetooth Pule Sensor TICKR">
