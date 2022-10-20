'use strict';

const Homey = require('homey');

class RGBWRemoteApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('RGBW Remote App has been initialized');
  }

}

module.exports = RGBWRemoteApp;
