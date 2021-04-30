import { CustomData, Env } from "../monitor";
import { PerformanceData } from "../performance";
import { INetworkInfo } from "../util";

/**
 * TrackerEvents.event will emit all events
 */
export enum TrackerEvents {
  event = "event",
  jsError = "jsError",
  reqError = "reqError",
  unHandleRejection = "unHandleRejection",
  performanceInfoReady = "performanceInfoReady",
  slowHttpRequest = "slowHttpRequest"
}

export enum IBehaviorItemType {
  fn = "function",
  console = "console",
  http = "http",
  custom = "custom",
  tap = "tap"
}

export interface IReq {
  url: string;
  header?: any;
  dataType?: string;
}

export interface IRes {
  data?: any;
  header?: any;
  statusCode?: number;
  cookies?: string[];
  errMsg: string;
}

export interface IHttpInfo {
  req: IReq;
  res: IRes;
}

export type ActivePage = WechatMiniprogram.Page.Instance<
  Record<string, any>,
  Record<string, any>
> | null;

export interface IBehaviorItem extends Partial<IHttpInfo> {
  time?: number;
  type?: IBehaviorItemType;
  message?: string;
  method?: string;
  activePage?: ActivePage;
  belong?: string;
  args?: any;
  timeConsume?: number;
}

export interface IDecorateData {
  env?: Env;
  scene?: number;
  time?: number;
  systemInfo?: WechatMiniprogram.SystemInfo | null;
  network?: INetworkInfo[];
  performanceData?: PerformanceData;
  customData?: CustomData;
  globalData?: any;
}

export interface IBaseError extends IDecorateData {
  behavior: IBehaviorItem[];
  error: string;
}

export interface IReqError extends IBaseError, IHttpInfo {
  timeConsume?: number
}
