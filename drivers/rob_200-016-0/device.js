'use strict';

const {
    ZigBeeDevice
} = require('homey-zigbeedriver');
const {
    debug, CLUSTER
} = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');
const LevelControlBoundCluster = require('../../lib/LevelControlBoundCluster');
const ColorControlBoundCluster = require('../../lib/ColorControlBoundCluster');
const ScenesBoundCluster = require('../../lib/ScenesBoundCluster');
const BasicBoundCluster = require('../../lib/BasicBoundCluster');

class RGBWRemoteControl extends ZigBeeDevice {

    /* The group number is one of bottom 3 buttons on the remote. They correspond to the Endpoint groups of the Zigbee device.
   @abstract
   @return int
   */
    _getGroupNumber() {
        this.error("Called group number method that should be overwritten");
        return 0;
    }

    async onNodeInit({
        zclNode
    }) {
        this.log('Init rgbw device class' + this._getGroupNumber());
        // Bind on/off button commands
        //debug(true);


        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
            onToggle: this._toggleCommandHandler.bind(this),
            onSetOn: this._toggleCommandHandler.bind(this),
            onSetOff: this._toggleCommandHandler.bind(this)
        }));
        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
            stepWithOnOff: this._levelControlCommandHandler.bind(this)
        }));
        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.COLOR_CONTROL.NAME, new ColorControlBoundCluster({
            moveToColor: this._colorControlCommandHandler.bind(this),
            moveToColorTemperature: this._colorControlCommandHandler.bind(this)
        }));

        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.SCENES.NAME, new ScenesBoundCluster({
            recallScene: this._scenesCommandHandler.bind(this),
            storeScene: this._scenesCommandHandler.bind(this)
        }));
        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.BASIC.NAME, new BasicBoundCluster({
            factoryReset: this._basicCommandHandler.bind(this),
            recallScene: this._scenesCommandHandler.bind(this)
        }));


    }

    _toggleCommandHandler() {
        this.log('Command handler triggered ' + this._getGroupNumber());
        this.triggerFlow({id: 'toggled'})
        .then(() => this.log('flow was triggered', 'toggled'))
         .catch (err => this.error('Error: triggering flow', 'toggled', err));
    }

    _levelControlCommandHandler() {
        this.log('LC Command handler triggered ' + this._getGroupNumber());
    }

    _colorControlCommandHandler() {
        this.log('CC Command handler triggered ' + this._getGroupNumber());
    }

    _scenesCommandHandler({
        groupId, sceneId
    }) {
        this.log('Scenes Command handler triggered ' + this._getGroupNumber() + ' Group ' + groupId + ' Scene ' + sceneId);
    }

    _basicCommandHandler(sceneId) {
        this.log('Basic Command handler triggered ' + this._getGroupNumber() + 'scene ' + sceneId);
    }
}

module.exports = RGBWRemoteControl;