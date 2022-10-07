'use strict';

const RGBWRemoteControl = require('./device.js');

class SecondGroupDevice extends RGBWRemoteControl {
  
  _getGroupNumber() {
    return 2;
  }
}
module.exports = SecondGroupDevice;
