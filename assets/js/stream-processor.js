export class StreamProcessor {
  constructor() {}

  async getMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = [];
      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          videoDevices.push(device);
        }
      });
      return videoDevices;
    } catch (error) {
      console.log('virtualCamera.js error', error);
      throw error;
    }
  }

  async getVideoStreams(devices) {
    const streams = [];
    try {
      if (devices.length === 0) return [];

      for (let index = 0; index < devices.length; index++) {
        const device = devices[index];
        const { deviceId } = device;
        const constraints = {
          audio: false,
          video: {
            width: 640,
            height: 360,
            deviceId: {
              exact: deviceId,
            },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streams.push(stream);
      }

      // const streams = await Promise.all(
      //   devices.map((device) => {
      //     const { deviceId } = device;
      //     const constraints = {
      //       audio: false,
      //       video: {
      //         width: 640,
      //         height: 360,
      //         deviceId: {
      //           exact: deviceId,
      //         },
      //       },
      //     };

      //     return navigator.mediaDevices.getUserMedia(constraints);
      //   })
      // );
      console.log('streams', streams);

      return streams;
    } catch (error) {
      console.error('virtualCamera.js error', error);
      throw error;
    }
  }

  createCanvas(canvasId = 'canvas1') {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    console.log('canvas', canvas, 'ctx', ctx);

    return { canvas, ctx };
  }
}
