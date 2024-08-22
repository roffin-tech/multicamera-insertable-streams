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
  }

  async draw() {
    try {
      console.log('canvas', this.videos_);

      for (let index = 0; index < this.videos_.length; index++) {
        const stream = this.videos_[index];

        // const videoFrame = new VideoFrame(stream.getVideoTracks()[0], { timestamp: 0 });
        await this.ctx_.drawImage(stream, 0 + 210 * index, 0, 210, 320);
      }
    } catch (error) {
      console.log('error', error);
    }

    return {
      canvas: this.canvas_,
      ctx: this.ctx_,
    };
  }
}
