import { CanvasTransform } from './canvas-transform';

export class StreamTransformer {
  constructor(streams) {
    this._transformer = new CanvasTransform();
    this._abortController = new AbortController();
    this._streams = streams;

  }

  async startPipeline() {
    await this._transformer.init(); // Initialize the 2D context.
    // capture the video stream from offscreen canvas
    const videoStream = this._streams[0]; // canvas.captureStream(30)
    const videoTrack = videoStream.getVideoTracks()[0]; // eslint-disable-next-line no-undef
    const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    // eslint-disable-next-line no-undef
    const trackGenerator = new MediaStreamTrackGenerator({ kind: 'video' });

    const transformer = new TransformStream({
      async transform(videoFrame, controller) {
        if (signal.aborted) {
          videoFrame.close();
          return;
        }
        await this._transformer.transform(videoFrame, controller);
      },
    });

    const source = trackProcessor.readable;
    const sink = trackGenerator.writable;
    const signal = this._abortController.signal;

    const promise = source.pipeThrough(transformer, { signal }).pipeTo(sink);
    promise.catch((e) => {
      if (signal.aborted) {
        // eslint-disable-next-line no-console
        console.log('aborted');
      } else {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      source.cancel(e);
      sink.abort(e);
    });

    const streamAfter = new MediaStream([trackGenerator]);
    // todo : video devices add or remove detection

    return streamAfter;
  }
}
