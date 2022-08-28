'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

const OnOffBoundCluster = require('../../lib/OnOffBoundCluster');

class RGBWRemoteControl extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
this.log('Init rgbw device class');
    // Bind on/off button commands
    zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onToggle: this._toggleCommandHandler.bind(this),
      onSetOn: this._toggleCommandHandler.bind(this),
      onSetOff: this._toggleCommandHandler.bind(this)
    }));
  }

  _toggleCommandHandler() {
    this.log('Command handler triggered');
     this.triggerFlow({ id: 'toggled' })
      .then(() => this.log('flow was triggered', 'toggled'))
      .catch(err => this.error('Error: triggering flow', 'toggled', err));
  }

}

module.exports = RGBWRemoteControl;
