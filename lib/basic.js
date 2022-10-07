'use strict';

const {BasicCluster, ZCLDataTypes, Cluster} = require('zigbee-clusters');

class ExtendedBasicCluster extends BasicCluster {

  static get ATTRIBUTES() {
    let result = super.ATTRIBUTES;
    result.name = {
    id: 16389,
    type: ZCLDataTypes.uint8
  };
    return result;
  }
}

Cluster.addCluster(ExtendedBasicCluster);

module.exports = ExtendedBasicCluster;