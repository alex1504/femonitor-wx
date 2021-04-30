import { Monitor } from "./monitor";
import {
  IBehaviorItemType,
  IHttpInfo,
  IReqError,
  TrackerEvents
} from "./types";

export function interceptRequest(monitor: Monitor) {
  const originRequest = wx.request;
  Object.defineProperty(wx, "request", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (options: WechatMiniprogram.RequestOption) {
      const originSuccess = options.success;
      const originFail = options.fail;
      const reqStartTime = Date.now();

      options.success = function (...args) {
        const timeConsume = Date.now() - reqStartTime;

        typeof originSuccess === "function" &&
          originSuccess.call(this, ...args);

        const res = args[0];
        handleSuccessCallback(monitor, options, res, timeConsume);
        handleSlowHttpRequest(monitor, options, res, timeConsume);
      };

      options.fail = function (...args) {
        typeof originFail === "function" && originFail.call(this, ...args);

        const res = args[0];
        handleFailCallback(monitor, options, res);
      };

      return originRequest.call(this, options);
    }
  });
}

export function handleSlowHttpRequest(
  monitor: Monitor,
  options: WechatMiniprogram.RequestOption,
  res: WechatMiniprogram.RequestSuccessCallbackResult,
  timeConsume: number
) {
  const httpTimeout = monitor.$options.httpTimeout;
  if (httpTimeout <= 0) return;

  if (timeConsume > monitor.$options.httpTimeout) {
    const httpInfo: IHttpInfo = getSuccessHttpInfo(options, res);

    monitor.emit(TrackerEvents.slowHttpRequest, { ...httpInfo, timeConsume });
  }
}

export function handleSuccessCallback(
  monitor: Monitor,
  options: WechatMiniprogram.RequestOption,
  res: WechatMiniprogram.RequestSuccessCallbackResult,
  timeConsume: number
): void {
  const httpInfo: IHttpInfo = getSuccessHttpInfo(options, res);

  monitor.pushBehaviorItem({
    ...httpInfo,
    timeConsume,
    type: IBehaviorItemType.http
  });

  if (res.statusCode < 200 || res.statusCode > 400) {
    const errorObj = monitor.processData<IReqError>({
      ...httpInfo,
      timeConsume,
      error: res.errMsg,
      behavior: monitor.behavior
    });
    monitor.emit(TrackerEvents.reqError, errorObj);
  }
}

export function handleFailCallback(
  monitor: Monitor,
  options: WechatMiniprogram.RequestOption,
  res: WechatMiniprogram.GeneralCallbackResult
): void {
  const reqInfo = getReqInfo(options);
  const resInfo = getFailResInfo(res);
  const httpInfo: IHttpInfo = {
    req: reqInfo,
    res: resInfo
  };

  const errorObj = monitor.processData<IReqError>({
    ...httpInfo,
    error: res.errMsg,
    behavior: monitor.behavior
  });

  monitor.pushBehaviorItem({
    ...httpInfo,
    type: IBehaviorItemType.http
  });
  monitor.emit(TrackerEvents.reqError, errorObj);
}

export function getReqInfo(options: WechatMiniprogram.RequestOption) {
  const header = options
    ? options.header
    : {
        "content-type": "application/json"
      };

  return {
    header,
    url: options.url,
    data: options.data,
    dataType: options.dataType
  };
}

export function getSuccessResInfo(
  res: WechatMiniprogram.RequestSuccessCallbackResult
) {
  return {
    data: res.data,
    header: res.header,
    statusCode: res.statusCode,
    cookies: res.cookies,
    errMsg: res.errMsg
  };
}

export function getFailResInfo(res: WechatMiniprogram.GeneralCallbackResult) {
  return {
    errMsg: res.errMsg
  };
}

export function getSuccessHttpInfo(
  options: WechatMiniprogram.RequestOption,
  res: WechatMiniprogram.RequestSuccessCallbackResult
) {
  const reqInfo = getReqInfo(options);
  const resInfo = getSuccessResInfo(res);
  const httpInfo: IHttpInfo = {
    req: reqInfo,
    res: resInfo
  };

  return httpInfo;
}
