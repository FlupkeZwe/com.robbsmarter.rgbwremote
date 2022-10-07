'use strict';

const {
    BoundCluster
} = require('zigbee-clusters');

class ColorControlBoundCluster extends BoundCluster {

    constructor({
      moveToColor, moveToColorTemperature
    }) {
        super();
        this._moveToColor = moveToColor;
        this._moveToColorTemperature = moveToColorTemperature;
    }

    /*
  moveToColor: {
    id: 7,
    args: {
      colorX: ZCLDataTypes.uint16,
      colorY: ZCLDataTypes.uint16,
      transitionTime: ZCLDataTypes.uint16,
    },
  },*/
    moveToColor(payload) {
        if (typeof this._moveToColor === 'function') {
            this._moveToColor(payload);
        }
    }
    /*
  moveToColorTemperature: {
    id: 10,
    args: {
      colorTemperature: ZCLDataTypes.uint16,
      transitionTime: ZCLDataTypes.uint16,
    },
  },*/
    moveToColorTemperature(payload) {
        if (typeof this._moveToColorTemperature === 'function') {
            this._moveToColorTemperature(payload);
        }
    }

}

module.exports = ColorControlBoundCluster;