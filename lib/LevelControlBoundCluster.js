'use strict';

const {
    BoundCluster
} = require('zigbee-clusters');

class LevelControlBoundCluster extends BoundCluster {

    constructor({
       groupId,
       stepWithOnOff
    }) {
        super();
        this._groupId = groupId;
        this._stepWithOnOff = stepWithOnOff;
    }


    /**
   *stepWithOnOff: {
    id: 6,
    args: {
      mode: ZCLDataTypes.enum8({
        up: 0,
        down: 1,
      }),
      stepSize: ZCLDataTypes.uint8,
      transitionTime: ZCLDataTypes.uint16,
    },
  },*/
    stepWithOnOff(payload) {
        if (typeof this._stepWithOnOff === 'function') {
            payload.groupId = this._groupId;
            this._stepWithOnOff(payload);
        }
    }

}

module.exports = LevelControlBoundCluster;