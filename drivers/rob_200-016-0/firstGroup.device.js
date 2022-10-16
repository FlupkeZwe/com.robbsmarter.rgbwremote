'use strict';

const RGBWRemoteControl = require('./device.js');

class FirstGroupDevice extends RGBWRemoteControl {

    _getGroupNumber() {
        return 1;
    }

    async onNodeInit({
        zclNode
    }) {

        const recallSceneTriggerCard = this.homey.flow.getDeviceTriggerCard('recall_scene');
        recallSceneTriggerCard.registerRunListener(async(args, state) => {
            return args.scene_name == state.sceneId;
        });

        super.onNodeInit({
            zclNode
        });
    }
}
module.exports = FirstGroupDevice;