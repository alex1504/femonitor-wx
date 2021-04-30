import merge from "deepmerge";
import { EventEmitter } from "events";
import { interceptRequest } from "./interceptRequest";
import { observePagePerformance, PerformanceData } from "./performance";
import { IProcessDataHandler, processDataFactory } from "./processData";
import { rewriteApp } from "./rewriteApp";
import { rewriteConsole } from "./rewriteConsole";
import { rewritePage } from "./rewritePage";
import {
  ActivePage,
  IBaseError,
  IBehaviorItem,
  IBehaviorItemType,
  TrackerEvents
} from "./types";
import * as Util from "./util";

export enum Env {
  Dev = "dev",
  Sandbox = "sandbox",
  Production = "production"
}

export interface IPerformanceOptions {
  watch: boolean;
  queueLimit: number;
}

export interface IBehaviorOptions {
  isFilterConsole: boolean;
  queueLimit: number;
  methodWhiteList: string[];
  methodBlackList: string[];
}

export type CustomData = Record<string, any>;

export interface IErrorOptions {
  random: number;
  filters: RegExp[];
}

export interface IMonitorOptions {
  env: Env;
  isSystemInfo: boolean;
  isNetwork: boolean;
  httpTimeout: number;
  error: IErrorOptions;
  behavior: IBehaviorOptions;
  performance: IPerformanceOptions;
}

export const defaultOptions = {
  env: Env.Dev,
  isSystemInfo: true,
  isNetwork: true,
  httpTimeout: 0,
  error: {
    filters: [],
    random: 1
  },
  behavior: {
    isFilterConsole: false,
    queueLimit: 20,
    methodWhiteList: [],
    methodBlackList: []
  },
  performance: {
    watch: true,
    queueLimit: 20
  }
};

export const ERROR_EVENTS: string[] = [
  TrackerEvents.jsError,
  TrackerEvents.reqError,
  TrackerEvents.unHandleRejection
];

export class Monitor extends EventEmitter {
  public static instance: Monitor;
  public $options: IMonitorOptions;
  public activePage: ActivePage;
  public systemInfo: WechatMiniprogram.SystemInfo | null;
  public performanceData: PerformanceData;
  public network: Util.INetworkInfo[];
  public scene: number;
  public processData: IProcessDataHandler;
  public behavior: IBehaviorItem[];
  public customData: CustomData;

  constructor(options: IMonitorOptions) {
    super();

    this.initProperties(options);
    this.processData = processDataFactory(this);

    if (this.$options.isNetwork) {
      this.getNetworkInfo();
      this.observeNetworkChange();
    }

    if (this.$options.isSystemInfo) {
      this.getSystemInfo();
    }

    rewriteApp(this);
    rewritePage(this);
    rewriteConsole(this);
    interceptRequest(this);

    if (this.$options.performance.watch) {
      observePagePerformance(this);
    }
  }

  static init(options: Partial<IMonitorOptions>): Monitor {
    if (this.instance) {
      return this.instance;
    }

    const mergeOptions = options
      ? merge(defaultOptions, options)
      : defaultOptions;

    return (this.instance = new Monitor(mergeOptions));
  }

  private initProperties(options: IMonitorOptions) {
    this.$options = options;
    this.activePage = null;
    this.systemInfo = null;
    this.customData = {};
    this.network = [];
    this.performanceData = [];
    this.behavior = [];
  }

  public handleErrorEvent(eventName: TrackerEvents, error: Error): void {
    const errorStr = error.toString().trim();
    const errorObj = this.processData<IBaseError>({
      error: errorStr,
      behavior: this.behavior
    });

    this.emit(eventName, errorObj);
  }

  public handleOnLaunch(options: any) {
    this.scene = options && options.scene;
  }

  public pushBehaviorItem(item: IBehaviorItem): IBehaviorItem {
    if (!item.type) {
      item.type = IBehaviorItemType.custom;
    }

    if (!item.time) {
      item.time = Date.now();
    }

    const { queueLimit } = this.$options.behavior;

    if (this.behavior.length >= queueLimit) {
      this.behavior.shift();
    }

    this.behavior.push(item);

    return item;
  }

  public async getNetworkInfo(): Promise<Util.INetworkInfo[]> {
    if (this.network.length) return this.network;

    const networkInfo = await Util.getNetworkInfo();
    this.network.push(networkInfo);

    return this.network;
  }

  public async observeNetworkChange() {
    Util.observeNetworkChange(this);
  }

  public async getSystemInfo(): Promise<WechatMiniprogram.SystemInfo> {
    if (this.systemInfo) return this.systemInfo;

    const systemInfo = await Util.getSystemInfo();
    return (this.systemInfo = systemInfo);
  }

  public setCustomData(
    key: string,
    value: Record<string, unknown> | string | number | Array<any>
  ): Monitor;
  public setCustomData(options: Record<string, unknown>): Monitor;
  public setCustomData(
    key: Record<string, unknown> | string,
    value:
      | Record<string, unknown>
      | string
      | number
      | boolean
      | Array<any> = true
  ): Monitor {
    if (typeof key === "string") {
      this.customData[key as string] = value;
    } else if (Util.isObject(key)) {
      value = key;
      this.customData = {
        ...this.customData,
        ...value
      };
    }

    return this;
  }

  isRandomError(options: IMonitorOptions): boolean {
    const rate = options.error.random;

    return Math.random() <= rate;
  }

  isFilterError(options: IMonitorOptions, errorStr: string) {
    const rules = options.error.filters;

    if (!rules.length) return false;

    return rules?.some((regExp) => {
      if (regExp.test(errorStr)) {
        return true;
      }

      return false;
    });
  }

  isEmitErrorEvent(emitData: any) {
    const isRandom = this.isRandomError(this.$options);
    const isFilter = this.isFilterError(
      this.$options,
      emitData.error as string
    );

    return isRandom && !isFilter;
  }

  /* Rewrite super.emit, to add some custom logic */
  emit(event: string, data: any): boolean {
    const isErrorEvent = ERROR_EVENTS.includes(event);
    /* Check if error events hit random sample and match filter rule */
    if (isErrorEvent && !this.isEmitErrorEvent(data)) {
      return false;
    }

    /* TrackerEvents.events listen all emit events */
    super.emit(TrackerEvents.event, event, data);

    return super.emit(event, data);
  }
}
