import { IMonitorOptions, Monitor } from "./monitor";
import { IBehaviorItemType } from "./types";
import { getActivePage } from "./util";

export function setElementTrackHandler(
  monitor: Monitor,
  pageOptions: WechatMiniprogram.Page.Options<
    WechatMiniprogram.Page.DataOption,
    WechatMiniprogram.Page.CustomOption
  >
) {
  const originHandler = pageOptions.onElementTrack;

  pageOptions.onElementTrack = function (e: WechatMiniprogram.TouchEvent) {
    /* Record element tap behaviors */
    monitor.pushBehaviorItem({
      belong: "page",
      method: "onElementTrack",
      activePage: monitor.activePage,
      type: IBehaviorItemType.tap,
      args: e
    });

    if (typeof originHandler === "function") {
      originHandler.call(this, e);
    }
  };
}

/**
 * Check if methodName need to record
 */
export function isTrackCustomFn(
  options: IMonitorOptions,
  methodName: string
): boolean {
  const { methodWhiteList, methodBlackList } = options.behavior;
  if (methodWhiteList.length) {
    return methodWhiteList.includes(methodName);
  }

  if (methodBlackList.length) {
    return !methodBlackList.includes(methodName);
  }

  /* Don't track onElementTrack fn because it is tracked by element tap event */
  return methodName !== "onElementTrack";
}

export function rewritePage(monitor: Monitor) {
  const originPage = Page;

  Page = function (pageOptions) {
    /* Add element tab handler to pageOptions */
    setElementTrackHandler(monitor, pageOptions);

    Object.keys(pageOptions).forEach((methodName) => {
      const originMethod = pageOptions[methodName];
      if (typeof originMethod !== "function") {
        return true;
      }

      (pageOptions as any)[methodName] = function (options: any) {
        if (["onLoad", "onShow"].includes(methodName)) {
          monitor.activePage = getActivePage();
        }

        /* Record page function behaviors */
        if (isTrackCustomFn(monitor.$options, methodName)) {
          monitor.pushBehaviorItem({
            belong: "page",
            method: `${methodName}`,
            activePage: monitor.activePage,
            type: IBehaviorItemType.fn,
            args: options
          });
        }

        return originMethod.call(this, options);
      };
    });

    return originPage(pageOptions);
  };
}
