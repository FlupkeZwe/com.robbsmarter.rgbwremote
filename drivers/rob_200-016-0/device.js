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

    async onNodeInit({
        zclNode
    }) {
        this.log('Init rgbw device class');
        // Bind on/off button commands
        debug(true);
        this.enableDebug();
        for (let i = 1; i <= 3; i++) {
            this._initBoundClusters(zclNode, i);
        }
        this._registerRunListeners();
    }
    
    _initBoundClusters(zclNode, endPointId) {
            zclNode.endpoints[endPointId].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
                groupId: endPointId,
                onToggle: this._toggleCommandHandler.bind(this),
                onSetOn: this._setOnCommandHandler.bind(this),
                onSetOff: this._setOffCommandHandler.bind(this)
            }));
            zclNode.endpoints[endPointId].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
                groupId: endPointId,
                stepWithOnOff: this._levelControlCommandHandler.bind(this)
            }));
            zclNode.endpoints[endPointId].bind(CLUSTER.COLOR_CONTROL.NAME, new ColorControlBoundCluster({
                groupId: endPointId,
                moveToColor: this._moveToColorCommandHandler.bind(this),
                moveToColorTemperature: this._moveToColorTemperatureCommandHandler.bind(this)
            }));
            zclNode.endpoints[endPointId].bind(CLUSTER.SCENES.NAME, new ScenesBoundCluster({
                groupId: endPointId,
                recallScene: this._scenesCommandHandler.bind(this),
                storeScene: this._scenesCommandHandler.bind(this)
            }));
            zclNode.endpoints[endPointId].bind(CLUSTER.BASIC.NAME, new BasicBoundCluster({
                groupId: endPointId,
                factoryReset: this._basicCommandHandler.bind(this),
                recallScene: this._scenesCommandHandler.bind(this)
            }));
        }
        
    _registerRunListeners() {
        this._initOnOffRunListeners();
        this._initLevelControlRunListeners();
        this._initColorControlRunListeners();
        this._initScenesRunListeners();
    }
    
    _registerDefaultGroupCheckRunListener(deviceCard) {
        deviceCard.registerRunListener(async(args, state) => {
            return args.group_id == state.groupId;
        });
    }
    
    _setOnCommandHandler({groupId}) {
        this.triggerFlow({id: 'set_on', tokens: {}, state: {groupId: groupId}})
        .then(() => this.log('flow was triggered', 'set_on'))
         .catch (err => this.error('Error: triggering flow', 'set_on', err));
        this._toggleCommandHandler({groupId: groupId});
    }
    
    _setOffCommandHandler({groupId}) {
        this.triggerFlow({id: 'set_off', tokens: {}, state: {groupId: groupId}})
        .then(() => this.log('flow was triggered', 'set_off'))
         .catch (err => this.error('Error: triggering flow', 'set_off', err));
         this._toggleCommandHandler({groupId: groupId});
    }

    _toggleCommandHandler({groupId}) {
        this.triggerFlow({id: 'toggled', tokens: {}, state: {groupId: groupId}})
        .then(() => this.log('flow was triggered', 'toggled'))
         .catch (err => this.error('Error: triggering flow', 'toggled', err));
    }
    
    _initOnOffRunListeners() {
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('set_on'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('set_off'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('toggled'));
    }

    _levelControlCommandHandler({groupId, mode, stepSize, transitionTime}) {
        this.log('LC Command handler triggered ' + groupId + ' mode ' + mode + ' stepSize ' + stepSize + ' tranTime ' + transitionTime);
        if (mode == 1) { //up
            this.triggerFlow({id: 'dim_up', tokens: {}, state: {groupId: groupId}})
            .then(() => this.log('flow was triggered', 'dim_up'))
         .catch (err => this.error('Error: triggering flow', 'dim_up', err));
        } else {
            this.triggerFlow({id: 'dim_down', tokens: {}, state: {groupId: groupId}})
            .then(() => this.log('flow was triggered', 'dim_down'))
         .catch (err => this.error('Error: triggering flow', 'dim_down', err));
        } 
    }
    _initLevelControlRunListeners() {
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('dim_up'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('dim_down'));
    }

    _moveToColorTemperatureCommandHandler({groupId, colorTemperature}) {
       this.triggerFlow({id: 'colortemp_changed', tokens: {temp: Math.max(0,Number(1 - colorTemperature / 65279).toFixed(2))}, state: {groupId: groupId}})
            .then(() => this.log('flow was triggered', 'colortemp_changed'))
         .catch (err => this.error('Error: triggering flow', 'colortemp_changed', err));
    }
    
    _moveToColorCommandHandler({groupId, colorX, colorY}) {
        this.log('Moving to color input X:' + colorX + ' Y:' + colorY);
        
        const rgb = ColorConverter.xy2rgb(colorX / 65536, colorY / 65536);
        this.log('Calculated RGB R:' + rgb.r + ' G:' + rgb.g + ' B:' + rgb.b);
        
        const hsv = ColorConverter.xy2hsv(colorX / 65536, colorY / 65536);
        this.log('Calculated HSV H:' + hsv.h + ' S:' + hsv.s + ' V:' + hsv.v);
        this.triggerFlow({id: 'color_hsv_moved', tokens: {hue: Math.min(1, Number(hsv.h / 360).toFixed(2)), saturation: Number(hsv.s.toFixed(2)), value: Number(hsv.v.toFixed(2))}, state: {groupId: groupId}})
            .then(() => this.log('flow was triggered', 'color_hsv_moved'))
         .catch (err => this.error('Error: triggering flow', 'color_hsv_moved', err));
    }
    
    _initColorControlRunListeners() {
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('colortemp_changed'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('color_hsv_moved'));
    }

    _scenesCommandHandler({
        groupId, sceneId
    }) {
        this.log('Scenes Command handler triggered ' + ' Group ' + groupId + ' Scene ' + sceneId);
        this.triggerFlow({id: 'recall_scene', tokens: {}, state: {sceneId: sceneId}})
            .then(() => this.log('flow was triggered', 'recall_scene'))
         .catch (err => this.error('Error: triggering flow', 'recall_scene', err));
    }
    
    _initScenesRunListeners() {
         const recallSceneTriggerCard = this.homey.flow.getDeviceTriggerCard('recall_scene');
        recallSceneTriggerCard.registerRunListener(async(args, state) => {
            return args.scene_name == state.sceneId && args.group_id == state.groupId;
        });
    }

    _basicCommandHandler({groupId}) {
        this.log('Basic Command handler triggered ' + groupId);
        // No action
    }
}

module.exports = RGBWRemoteControl;