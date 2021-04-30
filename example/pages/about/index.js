const app = getApp();

Page({
  data: {},
  onLoad(){},
  onShow() {},
  onJsError() {
    throw new Error("jsError");
  },
  onHttpError() {
    wx.request({
      url: "https://baidu.com/undefined"
    });
  },
  onPromiseError() {
    new Promise((resolve, reject) => {
      reject(new Error("test"));
    });
  }
});
