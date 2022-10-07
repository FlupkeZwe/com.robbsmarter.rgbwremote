'use strict';

const {Cluster, ZCLDataTypes} = require('zigbee-clusters');

const ATTRIBUTES = {};

const COMMANDS = {
  addScene: {
    id: 0,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
      transitionTime: ZCLDataTypes.uint16,
      sceneName: ZCLDataTypes.string,
      vars: ZCLDataTypes.data40
    }
    
  },
  viewScene: {
    id: 1,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8
    }
    
  },
  removeScene: {
    id: 2,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8
    }
    
  },
  removeAllScenes: {
    id: 3,
    args: {
      groupId: ZCLDataTypes.uint16
    }
    
  },
  storeScene: {
    id: 4,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8 
    }
    
  },
  recallScene: {
    id: 5,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8
    }
  },
  getSceneMembership: {
    id: 6,
    args: {
      groupId: ZCLDataTypes.uint16
    }
    
  },
};

class ScenesCluster extends Cluster {

  static get ID() {
    return 5;
  }

  static get NAME() {
    return 'scenes';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(ScenesCluster);

module.exports = ScenesCluster;
