import { Monitor } from "./monitor";
import { IBehaviorItemType, TrackerEvents } from "./types";

/**
 * onUnhandledRejection hook: App.hanldeOnUnhandledRejection doesn't support andriod platform by now.
 * See docs: https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onUnhandledRejection.html
 */
export const appHooks = [
  "onLaunch",
  "onShow",
  "onHide",
  "onError",
  "onUnhandledRejection"
];

export function rewriteApp(monitor: Monitor) {
  const originApp = App;

  App = function (appOptions) {
    appHooks.forEach((methodName) => {
      const originMethod = appOptions[methodName];

      (appOptions as any)[methodName] = function (param: any) {
        /* Record appHooks behaviors */
        monitor.pushBehaviorItem({
          belong: "app",
          method: `${methodName}`,
          activePage: null,
          type: IBehaviorItemType.fn,
          args: param
        });

        if (methodName === "onLaunch") {
          monitor.handleOnLaunch(param);
        }

        const error = param as Error;

        if (methodName === "onError") {
          monitor.handleErrorEvent(TrackerEvents.jsError, error);
        }

        if (methodName === "onUnhandledRejection") {
          monitor.handleErrorEvent(TrackerEvents.unHandleRejection, error);
        }

        return originMethod && originMethod.call(this, param);
      };
    });

    return originApp(appOptions);
  };
}
