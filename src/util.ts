import { Monitor } from "./monitor";
import { ActivePage } from "./types";

export interface INetworkInfo {
  status: string;
  time: number;
}

export function isObject(input: any): boolean {
  return Object.prototype.toString.call(input) === "[object Object]";
}

export function getPageUrl(): string {
  const curPages = getCurrentPages();
  return curPages[curPages.length - 1]
    ? curPages[curPages.length - 1].__route__
    : "";
}

export function getNetworkInfo(): Promise<INetworkInfo> {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        const networkInfo: INetworkInfo = {
          status: res.networkType,
          time: Date.now()
        };
        resolve(networkInfo);
      }
    });
  });
}

export function getSystemInfo(): Promise<WechatMiniprogram.SystemInfo> {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res);
      }
    });
  });
}

export function observeNetworkChange(monitor: Monitor) {
  wx.onNetworkStatusChange(function (res) {
    const networkInfo: INetworkInfo = {
      status: res.networkType,
      time: Date.now()
    };
    monitor.network.push(networkInfo);
  });
}

export function getActivePage(): ActivePage {
  const curPages = getCurrentPages();
  if (curPages.length) {
    return curPages[curPages.length - 1];
  }

  return null;
}
