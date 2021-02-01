var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,//当前加载页面下标
    limit: 10,
    isLoading: false, // 是否正在加载中
    isLoadComp: false, // 是否已经全部加载完成
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });


    this.getCategoryInfo();

  },
  getCategoryInfo: function() {
    let that = this;
    util.request(api.GoodsCategory, {
        id: this.data.id
      })
      .then(function(res) {

        if (res.errno == 0) {
          that.setData({
            navList: res.data.brotherCategory,
            currentCategory: res.data.currentCategory,
            page: 1,
            isLoading: false,
            isLoadComp: false,
          });

          wx.setNavigationBarTitle({
            title: res.data.parentCategory.name
          })

          // 当id是L1分类id时，这里需要重新设置成L1分类的一个子分类的id
          if (res.data.parentCategory.id == that.data.id) {
            that.setData({
              id: res.data.currentCategory.id
            });
          }

          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          that.getGoodsList();

        } else {
          //显示错误信息
        }

      });
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  getGoodsList: function() {
    if (this.data.isLoading) {
      console.log('数据正在加载，不用再次加载');
      return;
    } else if (this.data.isLoadComp) {
      console.log('当前页面数据加载完成，无需再次加载')
      return
    }
    var that = this;
    this.setData({
      isLoading: true
    })
    util.request(api.GoodsList, {
        categoryId: that.data.id,
        page: that.data.page,
        limit: that.data.limit
      })
      .then(res => {
        that.setData({
          goodsList: that.data.page <= 1 ? res.data.list : [...that.data.goodsList,...res.data.list],//res.data.list
          isLoading: false,
          isLoadComp: that.data.page >= res.data.pages
        });
      }).catch(err => {
        this.setData({
          isLoading: false
        })
      });
  },
  onReachBottom: function () {
    if (!this.data.isLoading) {
      if (!this.data.isLoadComp) {
        const newPage = this.data.page+1;
        this.setData({
          page: newPage
        });
        this.getGoodsList()
      }
    }
  },
  onUnload: function() {
    // 页面关闭
  },
  switchCate: function(event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  }
})