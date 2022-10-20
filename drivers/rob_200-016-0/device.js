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

const DEFAULT_BRIGHTNESS = 50;

class RGBWRemoteControl extends ZigBeeDevice {

    async onNodeInit({
        zclNode
    }) {
        debug(true);
        this.enableDebug();
        for (let i = 1; i <= 3; i++) {
            this._initBoundClusters(zclNode, i);
            this.setCapabilityValue(this._formatBrightnessCapabilityName(i), DEFAULT_BRIGHTNESS);
        }
        this._registerRunListeners();
        this._initAttributeReporting(zclNode);
    }
    
    async _initAttributeReporting(zclNode) {
    await this.configureAttributeReporting([
      {
        endpointId: 1,
        cluster: CLUSTER.POWER_CONFIGURATION,
        attributeName: "batteryPercentageRemaining",
        minInterval: 0,
        maxInterval: 8000,
        minChange: 1,
      }
    ]);

    zclNode.endpoints[1].clusters.powerConfiguration.on(
      "attr.batteryPercentageRemaining",
      (batteryPercentageRemaining) => {
        this.debug('Measured battery value (remaining percentage) ' +  batteryPercentageRemaining);
        this.setCapabilityValue("measure_battery", batteryPercentageRemaining);
      }
    );
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
                factoryReset: this._resetCommandHandler.bind(this),
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
        .then(() => this.debug('flow was triggered', 'set_on'))
         .catch (err => this.error('Error: triggering flow', 'set_on', err));
        this._toggleCommandHandler({groupId: groupId});
    }
    
    _setOffCommandHandler({groupId}) {
        this.triggerFlow({id: 'set_off', tokens: {}, state: {groupId: groupId}})
        .then(() => this.debug('flow was triggered', 'set_off'))
         .catch (err => this.error('Error: triggering flow', 'set_off', err));
         this._toggleCommandHandler({groupId: groupId});
    }

    _toggleCommandHandler({groupId}) {
        this.triggerFlow({id: 'toggled', tokens: {}, state: {groupId: groupId}})
        .then(() => this.debug('flow was triggered', 'toggled'))
         .catch (err => this.error('Error: triggering flow', 'toggled', err));
    }
    
    _initOnOffRunListeners() {
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('set_on'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('set_off'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('toggled'));
    }

    _levelControlCommandHandler({groupId, mode, stepSize, transitionTime}) {
        const current_brightness = this.getCapabilityValue(this._formatBrightnessCapabilityName(groupId));
        if (mode == 'up') {
            this.setCapabilityValue(this._formatBrightnessCapabilityName(groupId), Math.min(100, current_brightness + Math.round(stepSize / 254 * 100)));
            this.triggerFlow({id: 'dim_up', tokens: {}, state: {groupId: groupId}})
            .then(() => this.debug('flow was triggered', 'dim_up'))
         .catch (err => this.error('Error: triggering flow', 'dim_up', err));
        } else {
            this.setCapabilityValue(this._formatBrightnessCapabilityName(groupId), Math.max(0, current_brightness - Math.round(stepSize / 254 * 100)));
            this.triggerFlow({id: 'dim_down', tokens: {}, state: {groupId: groupId}})
            .then(() => this.debug('flow was triggered', 'dim_down'))
         .catch (err => this.error('Error: triggering flow', 'dim_down', err));
        } 
    }
    _initLevelControlRunListeners() {
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('dim_up'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('dim_down'));
    }

    _moveToColorTemperatureCommandHandler({groupId, colorTemperature}) {
       this.triggerFlow({id: 'colortemp_changed', tokens: {temp: Math.max(0,Number((colorTemperature - 150) / 300).toFixed(2))}, state: {groupId: groupId}})
            .then(() => this.debug('flow was triggered', 'colortemp_changed'))
         .catch (err => this.error('Error: triggering flow', 'colortemp_changed', err));
    }
    
    _moveToColorCommandHandler({groupId, colorX, colorY}) {
        const current_brightness = this.getCapabilityValue(this._formatBrightnessCapabilityName(groupId));
        const hsv = ColorConverter.xy2hsv(colorX / 65536, colorY / 65536, Math.max(1,Math.round(current_brightness / 100 * 254))); //at least brightness needs to be 1
        this.debug('Calculated HSV H:' + hsv.h + ' S:' + hsv.s + ' V:' + hsv.v);
        this.triggerFlow({id: 'color_hsv_moved', tokens: {hue: Math.min(1, Number(hsv.h / 360).toFixed(2)), saturation: Number(hsv.s.toFixed(2)), value: Number(hsv.v.toFixed(2))}, state: {groupId: groupId}})
            .then(() => this.debug('flow was triggered', 'color_hsv_moved'))
         .catch (err => this.error('Error: triggering flow', 'color_hsv_moved', err));
    }
    
    _initColorControlRunListeners() {
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('colortemp_changed'));
        this._registerDefaultGroupCheckRunListener(this.homey.flow.getDeviceTriggerCard('color_hsv_moved'));
    }

    _scenesCommandHandler({
        groupId, sceneId
    }) {
        this.triggerFlow({id: 'recall_scene', tokens: {}, state: {groupId: groupId, sceneId: sceneId}})
            .then(() => this.debug('flow was triggered', 'recall_scene'))
         .catch (err => this.error('Error: triggering flow', 'recall_scene', err));
    }
    
    _initScenesRunListeners() {
         const recallSceneTriggerCard = this.homey.flow.getDeviceTriggerCard('recall_scene');
        recallSceneTriggerCard.registerRunListener(async(args, state) => {
            return args.scene_name == state.sceneId && args.group_id == state.groupId;
        });
    }

    _resetCommandHandler({groupId}) {
        this.setCapabilityValue(this._formatBrightnessCapabilityName(groupId), DEFAULT_BRIGHTNESS);
    }
    
    _formatBrightnessCapabilityName(groupId) {
        return 'brightness_group' + groupId + '_capability';
    }
    
}

module.exports = RGBWRemoteControl;