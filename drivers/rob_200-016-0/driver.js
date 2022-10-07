'use strict';
const { ZigBeeDriver } = require("homey-zigbeedriver");

const FirstGroupDevice = require("./firstGroup.device.js");
const SecondGroupDevice = require("./secondGroup.device.js");
const ThirdGroupDevice = require("./thirdGroup.device.js");

class Driver extends ZigBeeDriver {
  onMapDeviceClass(device) {
    this.log("Entered onMapDeviceClass with " + device.getData().subDeviceId);
    if (device.getData().subDeviceId === "thirdGroup") {
      this.log("Exit with 3rd group");
      return ThirdGroupDevice;
    } else {
        if (device.getData().subDeviceId === "secondGroup") {
          this.log("Exit with 2nd group");
            return SecondGroupDevice;
        }
        this.log("Exit with 1st group");
      return FirstGroupDevice;
    }
  }
}

module.exports = Driver;