var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./utils/user.js');

App({
  onLaunch: function() {
    Promise.prototype.finally = function(callback){
      let P = this.constructor;
      return this.then(
              value => {
                   P.resolve(callback()).then(() => value)
               },
               reason => {
                   P.resolve(callback()).then(() => { throw reason })
               }
           )
    }
    const updateManager = wx.getUpdateManager();
    wx.getUpdateManager().onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
  
    // 获取胶囊位置
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    // console.log('胶囊位置：', menuButtonObject)
    this.globalData.menuBoundingRect = menuButtonObject
    wx.getSystemInfo({
      success: res => {
        console.log('获取设备信息成功。即将设置window变量', res)
        this.globalData.windowInfo = { height: res.windowHeight, width: res.windowWidth };
      },
      fail(err) {
        console.log(err);
      }
    })

  },
  onShow: function(options) {
    user.checkLogin().then(res => {
      this.globalData.hasLogin = true;
    }).catch(() => {
      this.globalData.hasLogin = false;
    });
  },
  globalData: {
    hasLogin: false,
  }
})