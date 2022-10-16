'use strict';

const { BoundCluster } = require('zigbee-clusters');

class OnOffBoundCluster extends BoundCluster {

  constructor({
    groupId, onToggle, onSetOn, onSetOff
  }) {
    super();
    this._groupId = groupId;
    this._onToggle = onToggle;
    this._onSetOn = onSetOn;
    this._onSetOff = onSetOff;
  }

  toggle() {
    if (typeof this._onToggle === 'function') {
      this._onToggle({groupId: this._groupId});
    }
  }
  
  setOn() {
    if (typeof this._onSetOn === 'function') {
      this._onSetOn({groupId: this._groupId});
    }
  }
  
  setOff() {
    if (typeof this._onSetOff === 'function') {
      this._onSetOff({groupId: this._groupId});
    }
  }

}

module.exports = OnOffBoundCluster;