/*
 *  Copyright (c) 2020 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

import { SpeechDetector } from './speech-detector';
import config from '@/config/layout';

/**
 * Applies a picture-frame effect using CanvasRenderingContext2D.
 * @implements {FrameTransform} in pipeline.js
 */
export class CanvasTransform {
  // eslint-disable-line no-unused-vars
  constructor(canvasDrawer, videos) {
    /**
     * @private {?OffscreenCanvas} canvas used to create the 2D context.
     *     Initialized in init.
     */
    this.canvas_ = null;
    /**
     * @private {?CanvasRenderingContext2D} the 2D context used to draw the
     *     effect. Initialized in init.
     */
    this.ctx_ = null;
    /** @private {string} */
    this.debugPath_ = 'debug.pipeline.frameTransform_';
    this.canvasDrawer_ = canvasDrawer;

    this.speechDetector1_ = new SpeechDetector();
    this.speechDetector2_ = new SpeechDetector();
    this.speechDetector1_.init();
    this.speechDetector2_.init();

    this.videos_ = videos;

    this.once_ = false;

    this.outputCanvas_ = document.getElementById('canvas2');
    this.outputCtx_ = this.outputCanvas_.getContext('2d');
    this.outputVideos_ = [];
  }
  /** @override */
  async init() {
    console.log('[CanvasTransform] Initializing 2D context for transform');
    this.canvas_ = new OffscreenCanvas(1, 1);
    this.ctx_ = /** @type {?CanvasRenderingContext2D} */ (
      this.canvas_.getContext('2d', { alpha: false, desynchronized: true })
    );
    if (!this.ctx_) {
      throw new Error('Unable to create CanvasRenderingContext2D');
    }
    console.log(
      '[CanvasTransform] CanvasRenderingContext2D initialized.',
      `${this.debugPath_}.canvas_ =`,
      this.canvas_,
      `${this.debugPath_}.ctx_ =`,
      this.ctx_
    );
  }

  /** @override */
  async transform(frame, controller) {
    const ctx = this.ctx_;
    if (!this.canvas_ || !ctx) {
      frame.close();
      return;
    }
    const width = frame.displayWidth;
    const height = frame.displayHeight;
    this.canvas_.width = width;
    this.canvas_.height = height;
    const timestamp = frame.timestamp;

    ctx.drawImage(frame, 0, 0);
    const canvasDrawer = await this.canvasDrawer_.draw(this.canvas_);
    const videos = [...this.videos_];
    const detectedVideos = await this.multiVideoDetector(videos);
    frame.close();

    this.outputVideos_ = await this.sortVideos(detectedVideos);
    // const results = await this.speechDetector_.detectForVideo(
    //   'video-2342343434'
    // );

    // if (results) {
    // this.outputVideos_ = await this.rankFaces(results);
    await this.draw();

    // }

    controller.enqueue(
      new VideoFrame(canvasDrawer.canvas, { timestamp, alpha: 'discard' })
    );
  }

  async sortVideos(videosCopy) {
    const sortedVideos = await videosCopy.sort((a, b) => {
      console.log(
        'a',
        a?.mouthPucker?.score,
        'b',
        b?.mouthPucker?.score,
        'a - b',
        parseFloat(a?.mouthPucker?.score) - parseFloat(b?.mouthPucker?.score),
        'index',
        a.id,
        b.id
      );

      return (
        parseFloat(b?.mouthPucker?.score) - parseFloat(a?.mouthPucker?.score)
      );
    });
    return sortedVideos;
  }

  async draw() {
    const dataConfig = config;
    try {
      for (let index = 0; index < this.outputVideos_.length; index++) {
        const start = await dataConfig[this.outputVideos_.length][index].x;
        const end = await dataConfig[this.outputVideos_.length][index].y;
        const stream = await this.outputVideos_[index].streamElement;
        await this.outputCtx_.drawImage(stream, start, end, 640, 360);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async multiVideoDetector(videos) {
    try {
      // for (let index = 0; index < videos.length; index++) {
      const results = await this[`speechDetector1_`].detectForVideo(
        videos[0].videoId
      );
      // console.log('results0', results);

      if (results) videos[0].mouthPucker = await this.setMouthPucker(results);

      const results1 = await this[`speechDetector2_`].detectForVideo(
        videos[1].videoId
      );
      // console.log('results1', results1);

      if (results1) videos[1].mouthPucker = await this.setMouthPucker(results1);
      // }
    } catch (error) {
      console.log('error', error);
    }
    // console.log('videos', videos);

    return videos;
  }

  async setMouthPucker(results) {
    const faceBlendshapes = results.faceBlendshapes;
    // const faceLandmarks = results.faceLandmarks;
    if (!faceBlendshapes || faceBlendshapes.length === 0) {
      return {
        score: -1,
      };
    }
    const element = faceBlendshapes[0];
    const categories = element.categories;
    const mouthPucker = await categories.find(
      (category) => category.categoryName === 'mouthPucker'
    );
    return mouthPucker;
  }

  /** @override */
  destroy() {}
}
