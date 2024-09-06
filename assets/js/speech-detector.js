import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class SpeechDetector {
  constructor() {
    this.faceLandmarker_ = null;
    this.lastVideoTime_ = -1;
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    this.faceLandmarker_ = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
    });
  }

  async detectForImage() {
    const image = document.getElementById('img-1');
    if (this.faceLandmarker_) {
      const results = this.faceLandmarker_.detect(image);
      console.log('faceLandmarker', results);
    }
  }

  async detectForVideo(videoId) {
    const video = document.getElementById(videoId);
    let startTimeMs = performance.now();
    if (this.lastVideoTime_ !== video?.currentTime) {
      this.lastVideoTime_ = video.currentTime;
      if (this.faceLandmarker_) {
        const results = this.faceLandmarker_.detectForVideo(video, startTimeMs);

        return results;
      }
    }
    return null;
  }
}
