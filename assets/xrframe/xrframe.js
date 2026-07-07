// Placeholder xrframe adapter for WeChat mini program
// Replace with actual xrframe implementation that supports mini-program camera/canvas
module.exports = {
  init: function (cameraCtx, canvasId) {
    // cameraCtx: wx.createCameraContext(thisPage)
    // canvasId: canvas-id string for drawing
    console.log('xrframe placeholder init called', cameraCtx, canvasId);
    // Example: setInterval to simulate detection loop
    try {
      const ctx = wx.createCanvasContext(canvasId);
      let count = 0;
      const timer = setInterval(() => {
        count++;
        ctx.setFillStyle('rgba(255,0,0,0.2)');
        ctx.fillRect(10, 10, 120, 80);
        ctx.setFontSize(14);
        ctx.setFillStyle('#fff');
        ctx.fillText('模拟 AR 检测 ' + count, 20, 50);
        ctx.draw();
        if (count > 100) clearInterval(timer);
      }, 500);
    } catch (e) {
      console.error('xrframe placeholder failed', e);
    }
  },
};
