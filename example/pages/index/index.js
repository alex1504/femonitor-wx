const app = getApp();

Page({
  data: {},
  onLoad() {},
  onShow() {},
  onJsError() {
    throw new Error("foo is not defined");
  },
  onHttpError() {
    console.log(this);
    wx.request({
      url: "https://baidu.com/undefined"
    });
  },
  onPromiseError() {
    new Promise((resolve, reject) => {
      reject(new Error("test"));
    });
  },
  onTestSlowHttpRequest() {
    wx.request({
      url: `https://www.baidu.com`
    });
  }
});
