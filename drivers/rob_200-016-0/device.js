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
const ColorConverter = require('../../lib/ColorConverter');

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
        debug(true);
        this.enableDebug();
        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
            onToggle: this._toggleCommandHandler.bind(this),
            onSetOn: this._toggleCommandHandler.bind(this),
            onSetOff: this._toggleCommandHandler.bind(this)
        }));
        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
            stepWithOnOff: this._levelControlCommandHandler.bind(this)
        }));
        zclNode.endpoints[this._getGroupNumber()].bind(CLUSTER.COLOR_CONTROL.NAME, new ColorControlBoundCluster({
            moveToColor: this._moveToColorCommandHandler.bind(this),
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

    _levelControlCommandHandler({mode, stepSize, transitionTime}) {
        this.log('LC Command handler triggered ' + this._getGroupNumber() + ' mode ' + mode + ' stepSize ' + stepSize + ' tranTime ' + transitionTime);
        if (mode == 1) { //up
            this.triggerFlow({id: 'dim_up'})
            .then(() => this.log('flow was triggered', 'dim_up'))
         .catch (err => this.error('Error: triggering flow', 'dim_up', err));
        } else {
            this.triggerFlow({id: 'dim_down'})
            .then(() => this.log('flow was triggered', 'dim_down'))
         .catch (err => this.error('Error: triggering flow', 'dim_down', err));
        }
        
        
        
    }

    _colorControlCommandHandler() {
        this.log('CC Command handler triggered ' + this._getGroupNumber());
    }
    
    _moveToColorCommandHandler({colorX, colorY}) {
        this.log('Moving to color input X:' + colorX + ' Y:' + colorY);
        
        const rgb = ColorConverter.xy2rgb(colorX / 65536, colorY / 65536);
        this.log('Calculated RGB R:' + rgb.r + ' G:' + rgb.g + ' B:' + rgb.b);
        
        const hsv = ColorConverter.xy2hsv(colorX / 65536, colorY / 65536);
        this.log('Calculated HSV H:' + hsv.h + ' S:' + hsv.s + ' V:' + hsv.v);
        this.triggerFlow({id: 'color_hsv_moved', tokens: {hue: hsv.h / 360, saturation: hsv.s, value: hsv.v}, state: {}})
            .then(() => this.log('flow was triggered', 'color_hsv_moved'))
         .catch (err => this.error('Error: triggering flow', 'color_hsv_moved', err));
    }

    _scenesCommandHandler({
        groupId, sceneId
    }) {
        this.log('Scenes Command handler triggered ' + this._getGroupNumber() + ' Group ' + groupId + ' Scene ' + sceneId);
        this.triggerFlow({id: 'recall_scene', tokens: {}, state: {sceneId: sceneId}})
            .then(() => this.log('flow was triggered', 'recall_scene'))
         .catch (err => this.error('Error: triggering flow', 'recall_scene', err));
    }

    _basicCommandHandler() {
        this.log('Basic Command handler triggered ' + this._getGroupNumber() + 'scene ' + sceneId);
        // No action
    }
}

module.exports = RGBWRemoteControl;