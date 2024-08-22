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
  }

  async draw() {
    const dataConfig = {
      1: {
        0: {
          x: 0,
          y: 0,
        },
      },
      2: {
        0: {
          x: 0,
          y: 180,
        },
        1: {
          x: 640,
          y: 180,
        },
      },
      3: {
        0: {
          x: 0,
          y: 0,
        },
        1: {
          x: 640,
          y: 0,
        },
        2: {
          x: 320,
          y: 360,
        },
      },
      4: {
        0: {
          x: 0,
          y: 0,
        },
        1: {
          x: 640,
          y: 0,
        },
        2: {
          x: 0,
          y: 360,
        },
        3: {
          x: 640,
          y: 360,
        },
      },
      5: {},
    };
    try {
      for (let index = 0; index < this.videos_.length; index++) {
        const start = dataConfig[this.videos_.length][index].x;
        const end = dataConfig[this.videos_.length][index].y;
        console.log('canvas', start, end);

        const stream = this.videos_[index];
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
