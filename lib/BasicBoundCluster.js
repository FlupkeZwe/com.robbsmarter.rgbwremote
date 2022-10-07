'use strict';

const {
    BoundCluster
} = require('zigbee-clusters');
const ExtendedBasicCluster = require('./basic.js');

class BasicBoundCluster extends BoundCluster {
    
    

    constructor({
       factoryReset,
       recallScene
    }) {
        super();
        this._factoryReset = factoryReset;
        this._recallScene = recallScene;
        this._name = 1;
    }
    
    set name(payload) {
        this._name = payload;
        this.recallScene(this._name);
    }
    
    get name() {
        return this._name;
    }


    /**
   *Factory reset is triggered - this means that all associated devices with this endpoint should return to their 'default' settings
   **/
    factoryReset() {
        if (typeof this._factoryReset === 'function') {
            this._factoryReset(this._name);
        }
    }
    
    /**
     *Special implementation for device where an attribute is written that indicates which scene should be recalled.
     *It cycles through the scenes.
     *We reuse the scene selector here and therefore insert groupID = 0
     **/
    recallScene(sceneId) {
        if (typeof this._recallScene === 'function') {
            this._recallScene({groupId: 0, sceneId: sceneId});
        }
    }

}

module.exports = BasicBoundCluster;