# Description
A SDK for wx miniprogramme error and performance monitor, using event subscription.

# Screenshot
![screenshot](https://cdn.jsdelivr.net/gh/sandy1504/media@master/20210407/screenshot.3vr18f6my320.gif)

# Example
Click this [here](https://developers.weixin.qq.com/s/eh8GtTm37oqB) to open WeChat Mini Program Developer Tool for test


# Feature
- [x] Error observe, includes js error, unhandle rejection error and http error
- [x] Error filters and error sampling
- [x] Slow http request observe
- [x] Observe user behaviors into a behavior queue
- [x] Performance observe for every page

# Install
## NPM
```
npm i femonitor-wx -S
```

## Directly download
Click [here](https://cdn.jsdelivr.net/npm/femonitor-wx@latest/dist/index.min.js) to dowload femonitor-wx sdk

# Usage
```js
const { Monitor } = require("femonitor-wx");

/* Options could be undefined because SDK has default options  */
const monitor = Monitor.init(options);

/* Listen all event */
monitor.on("event", (eventName, emitData) => {
  /* Use wx.request to report data here  */  
  console.log(eventName, emitData);
});
```

# DefaultOptions
Options param will be deepmerge into defaultOptions

```typescript
export const defaultOptions = {
  env: Env.Dev,   
  isSystemInfo: true,  // If get system info
  isNetwork: true,     // If get network info
  httpTimeout: 0,      // Define slow httptimeout(ms)
  error: {
    filters: [],       // Filter error using regexp array
    random: 1          // Extract error samples, 1 is 100%
  },
  behavior: {
    isFilterConsole: false,  // If record console behavior
    queueLimit: 20,          // Limit behavior queue to 20
    // Observe function name includes methodWhilteList, priority is higher than methodBlackList
    methodWhiteList: [],
    // Observe function name excludes methodBlackList
    methodBlackList: []
  },
  performance: {
    watch: true,       // If watch page performance
    queueLimit: 20     // Limit performane queue to 20
  }
};
```

# Support events

| EventName            | Description                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| jsError              | app.onError                                                             |
| unhandleRejection    | app.onunhandledrejection                                                |
| reqError             | Network request error                                                   |
| performanceInfoReady | Page performance data is ready                                          |
| slowHttpRequest      | Emit when http request cost time larger than timeout httpTimeout        |
| event                | Includes all events above                                               |

# Development

```
npm run watch
```

# Build

```
npm run build
```
