'use strict';

const {
    BoundCluster
} = require('zigbee-clusters');
const Scenes = require('./scenes.js');

class ScenesBoundCluster extends BoundCluster {

    constructor({
        recallScene,
        storeScene
    }) {
        super();
        this._recallScene = recallScene;
        this._storeScene = storeScene;
    }

    /*    id: 5,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8
    }*/
    recallScene(payload) {
        if (typeof this._recallScene === 'function') {
            this._recallScene(payload);
        }
    }
/**
 *  storeScene: {
    id: 4,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8 
    }
    
  },*/
    storeScene(payload) {
        if (typeof this._storeScene === 'function') {
            this._storeScene(payload);
        }
    }

}

module.exports = ScenesBoundCluster;