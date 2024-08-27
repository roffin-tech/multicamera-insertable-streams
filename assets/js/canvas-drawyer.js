import config from '../config/layout';

export class CanvasDrawer {
  constructor(videos, canvas, ctx) {
    /** @private {?OffscreenCanvas} canvas used to create the 2D context.
     *     Initialized in init.
     */
    this.canvas_ = canvas;
    /** @private {?CanvasRenderingContext2D} the 2D context used to draw the
     *     effect. Initialized in init.
     */
    this.ctx_ = ctx;
    /** @private {string} */
    this.debugPath_ = 'debug.pipeline.frameTransform_';
    this.videos_ = videos;
    this.config_ = config;
    // this.videoCofig_ = config;
  }

  async draw() {
    const dataConfig = config;
    try {
      for (let index = 0; index < this.videos_.length; index++) {
        const start = await dataConfig[this.videos_.length][index].x;
        const end = await dataConfig[this.videos_.length][index].y;
        const stream = await this.videos_[index];
        await this.ctx_.drawImage(stream, start, end, 640, 360);
      }
    } catch (error) {
      console.log('error', error);
    }

    return {
      canvas: this.canvas_,
      ctx: this.ctx_,
    };
  }

  async widthAndHeightCalculator() {}
}
