'use strict';

const RGBWRemoteControl = require('./device.js');

class ThirdGroupDevice extends RGBWRemoteControl {
  
  _getGroupNumber() {
    return 3;
  }
}
module.exports = ThirdGroupDevice;
