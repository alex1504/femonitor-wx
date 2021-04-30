import { Monitor } from "./monitor";
import { IDecorateData } from "./types";

export interface IProcessDataHandler {
  <T extends IDecorateData>(data: T): T;
}

export type IInitialEmitData = {
  [k: string]: any;
};

export function processDataFactory(monitor: Monitor): IProcessDataHandler {
  return function <T extends IDecorateData>(data: T): T {
    const { isNetwork, isSystemInfo, performance } = monitor.$options;
    const resData = Object.assign({}, data);

    resData.env = monitor.$options.env;
    resData.scene = monitor.scene;
    resData.customData = monitor.customData;
    resData.time = Date.now();
    resData.globalData = getApp().globalData;

    if (isNetwork) {
      resData.network = monitor.network;
    }

    if (isSystemInfo) {
      resData.systemInfo = monitor.systemInfo;
    }

    if (performance.watch) {
      resData.performanceData = monitor.performanceData;
    }

    return resData;
  };
}
