'use strict';

const RGBWRemoteControl = require('./device.js');

class FirstGroupDevice extends RGBWRemoteControl {
  
  _getGroupNumber() {
    return 1;
  }
}
module.exports = FirstGroupDevice;
