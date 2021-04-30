const { Monitor } = require("./lib/femonitor-wx/index.umd");

const monitor = Monitor.init({
  httpTimeout: 10
});
monitor.setCustomData("foo", "bar");
monitor.setCustomData({
  bar: "foo"
});

/* listen all event */
monitor.on("event", (eventName, emitData) => {
  console.log(eventName, emitData);
});

/* listen single event */
/* monitor
  .on("jsError", (error) => {
    console.log("event: jsError", error);
  })
  .on("reqError", (error) => {
    console.log("event: reqError", error);
  })
  .on("unHandleRejection", (error) => {
    console.log("event: unHandleRejection", error);
  })
  .on("performanceInfoReady", (info) => {
    console.log("event: performanceInfoReady", info);
  }); */

App({
  onLaunch() {},
  globalData: {
    foo: "bar"
  }
});
