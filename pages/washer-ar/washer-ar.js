Page({
  data: {
    markerImg: 'https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/marker/2dmarker-test.jpg',
    arReady: false,
    arTrackerState: '等待识别',
    arTrackerError: '',
    cameraAuthorized: false,
    loaded: false
  },

  onLoad(options) {
    this.checkCameraPermission();
  },

  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting && res.authSetting['scope.camera']) {
          this.setData({ cameraAuthorized: true });
          return;
        }

        wx.authorize({
          scope: 'scope.camera',
          success: () => {
            this.setData({ cameraAuthorized: true });
          },
          fail: () => {
            wx.showModal({
              title: '需要摄像头权限',
              content: '请允许访问摄像头以使用 AR 功能，点击“前往设置”开启权限。',
              confirmText: '前往设置',
              cancelText: '取消',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting({
                    success: (settingRes) => {
                      if (settingRes.authSetting && settingRes.authSetting['scope.camera']) {
                        this.setData({ cameraAuthorized: true });
                      }
                    }
                  });
                }
              }
            });
          }
        });
      },
      fail: () => {
        wx.authorize({
          scope: 'scope.camera',
          success: () => {
            this.setData({ cameraAuthorized: true });
          }
        });
      }
    });
  },

  handleReady({ detail }) {
    this.scene = detail.value;
    console.log('XR scene ready', this.scene);
  },

  handleAssetsProgress({ detail }) {
    console.log('assets progress', detail.value);
  },

  handleAssetsLoaded({ detail }) {
    console.log('assets loaded', detail.value);
    this.setData({ loaded: true });
  },

  handleARReady({ detail }) {
    console.log('AR ready', detail.value);
    this.setData({ arReady: true, arTrackerState: '扫描 Marker 中' });
  },

  handleARTrackerState({ detail }) {
    this.setData({ arTrackerState: detail.value });
  },

  handleARTrackerError({ detail }) {
    console.error('AR tracker error', detail.value);
    this.setData({ arTrackerError: detail.value });
  },

  handleChangeMarkerImg() {
    const successHandler = (res) => {
      const fp = (res.tempFilePaths && res.tempFilePaths[0]) || (res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath);
      if (fp) {
        this.setData({ markerImg: fp, arTrackerState: '已切换 Marker，重新识别中', arTrackerError: '' });
        return;
      }
      console.error('[xr-demo] choose image failed: no file path returned', res);
      wx.showToast({ title: '未获取到图片路径', icon: 'none' });
    };

    const failHandler = (err) => {
      console.error('[xr-demo] choose image failed', err);
      wx.showToast({ title: '选择图片失败', icon: 'none' });
    };

    if (typeof wx.chooseImage === 'function') {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: successHandler,
        fail: failHandler
      });
    } else if (typeof wx.chooseMedia === 'function') {
      wx.chooseMedia({
        count: 1,
        sizeType: ['compressed'],
        mediaType: ['image'],
        sourceType: ['album'],
        success: successHandler,
        fail: failHandler
      });
    } else {
      wx.showToast({ title: '当前版本不支持选图功能', icon: 'none' });
    }
  },

  requestCameraPermission() {
    this.checkCameraPermission();
  },

  handleLog({ detail }) {
    console.log('xr-log', detail.value);
  },

  onShareAppMessage() {
    return {
      title: 'Washer AR 体验',
      path: '/pages/washer-ar/washer-ar'
    };
  }
});
