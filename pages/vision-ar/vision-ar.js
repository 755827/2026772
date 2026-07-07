import * as THREE from 'three';

Page({
  data: {
    cameraAuthorized: false,
    status: '等待摄像头授权',
  },

  onLoad() {
    this.checkCameraPermission();
  },

  onReady() {
    this.initThreeScene();
  },

  onUnload() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
  },

  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting && res.authSetting['scope.camera']) {
          this.setData({ cameraAuthorized: true, status: '摄像头已授权' });
          return;
        }

        wx.authorize({
          scope: 'scope.camera',
          success: () => {
            this.setData({ cameraAuthorized: true, status: '摄像头已授权' });
          },
          fail: () => {
            this.setData({ cameraAuthorized: false, status: '请开启摄像头权限' });
          }
        });
      },
      fail: () => {
        this.setData({ cameraAuthorized: false, status: '摄像头权限检测失败' });
      }
    });
  },

  requestCameraPermission() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting && res.authSetting['scope.camera']) {
          this.setData({ cameraAuthorized: true, status: '摄像头已授权' });
          this.initThreeScene();
        }
      }
    });
  },

  initThreeScene() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#webgl').fields({ node: true, size: true }).exec((res) => {
      const canvas = res && res[0] && res[0].node;
      if (!canvas) {
        console.error('未能获取到 canvas 节点');
        this.setData({ status: '未能创建 WebGL 画布' });
        return;
      }

      const dpr = wx.getSystemInfoSync().pixelRatio || 1;
      const width = res[0].width * dpr;
      const height = res[0].height * dpr;
      canvas.width = width;
      canvas.height = height;

      const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true });
      if (!gl) {
        console.error('WebGL 上下文创建失败');
        this.setData({ status: 'WebGL 不可用，请检查版本支持' });
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width / dpr, height / dpr);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.set(0, 1.8, 3);

      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
      directionalLight.position.set(3, 5, 2);
      scene.add(directionalLight);

      const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const material = new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.4, metalness: 0.2 });
      const box = new THREE.Mesh(geometry, material);
      box.position.y = 0.6;
      scene.add(box);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0x111111, opacity: 0.25, transparent: true })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.2;
      scene.add(floor);

      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      this.box = box;
      this.setData({ status: 'VisionKit 画面已准备，正在渲染 AR 叠加' });
      this.startRenderLoop();
    });
  },

  startRenderLoop() {
    const render = () => {
      if (!this.renderer || !this.scene || !this.camera) {
        return;
      }
      this.box.rotation.y += 0.012;
      this.box.rotation.x += 0.005;
      this.renderer.render(this.scene, this.camera);
      this.renderTimer = setTimeout(render, 16);
    };
    render();
  },

  onShareAppMessage() {
    return {
      title: 'VisionKit + Three.js AR 小程序',
      path: '/pages/vision-ar/vision-ar'
    };
  }
});
