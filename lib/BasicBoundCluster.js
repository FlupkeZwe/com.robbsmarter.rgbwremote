'use strict';

const {
    BoundCluster
} = require('zigbee-clusters');
const ExtendedBasicCluster = require('./basic.js');

class BasicBoundCluster extends BoundCluster {
    
    

    constructor({
       groupId,
       factoryReset,
       recallScene
    }) {
        super();
        this._groupId = groupId;
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
            this._factoryReset({groupId: this._groupId, name: this._name});
        }
    }
    
    /**
     *Special implementation for device where an attribute is written that indicates which scene should be recalled.
     *It cycles through the scenes.
     **/
    recallScene(sceneId) {
        if (typeof this._recallScene === 'function') {
            this._recallScene({groupId: this._groupId, sceneId: sceneId});
        }
    }

}

module.exports = BasicBoundCluster;