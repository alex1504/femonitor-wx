import { Monitor } from "./monitor";
import { IBehaviorItemType, TrackerEvents } from "./types";

export type KeyofConsole = keyof typeof console;

export const hackConsoleFn = ["error", "warn"];

/**
 * iOS support App.onUnhandledRejection, doen't need to hack by console.error
 */
export const hackUnhandledRejectionPlatform = ["devtools", "android"];

export function rewriteConsole(monitor: Monitor) {
  for (const key of Object.keys(console)) {
    if (key in console) {
      const methodName = key as KeyofConsole;

      if (typeof console[methodName] !== "function") {
        continue;
      }

      if (!hackConsoleFn.includes(methodName)) {
        continue;
      }

      const originMethod = console[methodName];
      console[methodName] = function (...args: any[]) {
        /* Record console behaviors */
        if (!monitor.$options.behavior.isFilterConsole) {
          monitor.pushBehaviorItem({
            belong: "console",
            method: `${methodName}`,
            activePage: monitor.activePage,
            type: IBehaviorItemType.console,
            args
          });
        }

        /**
         * Let android wx miniprogramme catch unhandled promise rejection
         */
        if (args[0] === "Unhandled promise rejection") {
          const error = args[1] as Error;

          monitor.getSystemInfo().then((res) => {
            const isNeedEmit = hackUnhandledRejectionPlatform.includes(
              res.platform
            );
            if (isNeedEmit) {
              monitor.handleErrorEvent(TrackerEvents.unHandleRejection, error);
            }
          });
        }

        originMethod.call(this, ...args);
      };
    }
  }
}
