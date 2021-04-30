import { Monitor } from "./monitor";
import { TrackerEvents } from "./types";

export interface IPerformanceItem {
  duration: number;
  entryType: "script" | "render";
  name: "evaluateScript" | "firstRender";
  startTime: number;
  path?: string;
}

export type PerformanceData = IPerformanceItem[];

export function observePagePerformance(monitor: Monitor): void {
  const canIUse = wx.canIUse("Performance");

  if (monitor.performanceData.length) return;
  if (!canIUse) {
    return;
  }

  const performance = wx.getPerformance();

  const observer = performance.createObserver(
    (entryList: WechatMiniprogram.EntryList) => {
      const performanceData: PerformanceData = entryList.getEntries();

      const queueLimit = monitor.$options.performance.queueLimit;
      if (monitor.performanceData.length >= queueLimit) {
        monitor.performanceData.shift();
      }
      
      monitor.performanceData.push(...performanceData);
      monitor.emit(TrackerEvents.performanceInfoReady, monitor.performanceData);
    }
  );
  observer.observe({ entryTypes: ["render", "script"] });
}
