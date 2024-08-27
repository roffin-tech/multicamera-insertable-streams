<template>
  <div id="container">
    <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
      <span>Video processing with insertable streams</span>
    </h1>
    <canvas id="video1" width="1280" height="720" style="display: none;"></canvas>
    <!-- <video id="video2" width="640" height="360" controls playsinline autoplay muted></video> -->
  </div>
</template>

<script lang="ts" setup>
  import { CanvasDrawer } from '~/assets/js/canvas-drawyer';
  import { CanvasTransform } from '~/assets/js/canvas-transform';
  import { StreamProcessor } from '~/assets/js/stream-processor';

  const videoStreams: Ref<any> = ref([]);

  onMounted(async () => {
    if (typeof MediaStreamTrackProcessor === 'undefined' ||
      typeof MediaStreamTrackGenerator === 'undefined') {
      alert(
        'Your browser does not support the experimental MediaStreamTrack API ' +
        'for Insertable Streams of Media. See the note at the bottom of the ' +
        'page.');
    }

    const streams = new StreamProcessor();
    const { canvas, ctx } = streams.createCanvas();
    const devices = await streams.getMediaDevices();
    videoStreams.value = await streams.getVideoStreams(devices);
    const streamElements = renderVideoStreams(videoStreams.value) || [];
    const canvasDrawer = new CanvasDrawer(streamElements, canvas, ctx);

    const stream = videoStreams.value[0]

    const _transformer = new CanvasTransform(canvasDrawer)
    await _transformer.init()
    const videoTrack = stream.getVideoTracks()[0]
    const _abortController = new AbortController()
    // eslint-disable-next-line no-undef
    const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack })
    // eslint-disable-next-line no-undef
    const trackGenerator = new MediaStreamTrackGenerator({ kind: 'video' })

    const transformer = new TransformStream({
      async transform(videoFrame, controller) {
        if (signal.aborted) {
          videoFrame.close()
          return
        }
        await _transformer.transform(videoFrame, controller)
      },
    })

    const source = trackProcessor.readable
    const sink = trackGenerator.writable
    const signal = _abortController.signal

    const promise = source.pipeThrough(transformer, { signal }).pipeTo(sink)
    promise.catch((e) => {
      if (signal.aborted) {
        // eslint-disable-next-line no-console
        console.log('aborted')
      } else {
        // eslint-disable-next-line no-console
        console.error(e)
      }
      source.cancel(e)
      sink.abort(e)
    })

    const streamAfter = new MediaStream([trackGenerator])

    const body = document.querySelector('body')
    const videoElement: any = createVideoElement('video-2342343434', streamAfter)
    if (!videoElement.alreadyPresent)
      body?.appendChild(videoElement.videoPreviewElm)

    // speechDetector()

  })

  onBeforeUnmount(() => {
    stopTracks()
  })

  function createVideoElement(id, stream) {
    let videoPreviewElm: any = document.getElementById(id)
    const alreadyPresent = !!videoPreviewElm
    if (!alreadyPresent) {
      videoPreviewElm = document.createElement('video')
      videoPreviewElm.id = id
      videoPreviewElm.autoplay = true
      videoPreviewElm.controls = false
      videoPreviewElm.height = 720
      videoPreviewElm.width = 1280
    }
    videoPreviewElm.srcObject = stream

    return { videoPreviewElm, alreadyPresent }

  }

  function stopTracks() {
    videoStreams.value.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop())
    })
  }

  function renderVideoStreams(streams) {
    // TODO: able to pass in video element to render video stream

    if (streams.length === 0) return
    const body = document.querySelector('body')
    const div = document.createElement('div')
    div.id = 'virtual-camera-previews'
    div.style.display = 'none'

    const videoElements = []
    const cameraPreviewElm = div
    streams.forEach((stream, index) => {
      const videoPreviewElm = document.createElement('video')
      videoPreviewElm.id = `video-${index + 1}`
      videoPreviewElm.height = 360
      videoPreviewElm.width = 640
      videoPreviewElm.srcObject = stream
      videoPreviewElm.autoplay = true
      videoPreviewElm.controls = true
      videoPreviewElm.style.display = 'none'
      cameraPreviewElm.appendChild(videoPreviewElm)
      videoElements.push(videoPreviewElm)
    })

    body?.appendChild(div)

    return videoElements
  }


</script>
