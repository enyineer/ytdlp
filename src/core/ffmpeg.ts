import { existsSync } from 'fs';
import FFMPEGWrapper from 'fluent-ffmpeg';
import { Readable } from 'stream';
import commandExists from 'command-exists';

type Params = {
  ffmpegPath?: string;
  ffprobePath?: string;
}

enum Binary {
  FFMPEG,
  FFPROBE,
}

export class FFMPEG {
  private readonly ffmpegPath: string;
  private readonly ffprobePath: string;

  constructor(params?: Params) {
    this.ffmpegPath = this.getBinaryPath(Binary.FFMPEG, params?.ffmpegPath);
    this.ffprobePath = this.getBinaryPath(Binary.FFPROBE, params?.ffprobePath);
  }

  convertStreamable(stream: Readable) {
    const ffmpeg = FFMPEGWrapper(stream);
    ffmpeg.setFfmpegPath(this.ffmpegPath);
    ffmpeg.setFfprobePath(this.ffprobePath);
    ffmpeg.toFormat('mp3');
    return ffmpeg;
  }

  private getBinaryPath(binary: Binary, path?: string) {
    if (!path || !existsSync(path)) {
      if (process.platform === 'win32') {
        switch (binary) {
          case Binary.FFMPEG:
            return 'binaries/ffmpeg.exe';
          case Binary.FFPROBE:
            return 'binaries/ffprobe.exe';
        }
      }

      switch (binary) {
        case Binary.FFMPEG:
          const ffmpegPath = '/usr/bin/ffmpeg';
          if (commandExists.sync('ffmpeg')) {
            return ffmpegPath;
          } else {
            throw new Error(`Path ${path} does not exist and ffmpeg is not installed at ${ffmpegPath}`);
          }
        case Binary.FFPROBE:
          const ffprobePath = '/usr/bin/ffprobe';
          if (commandExists.sync('ffmpeg')) {
            return ffprobePath;
          } else {
            throw new Error(`Path ${path} does not exist and ffprobe is not installed at ${ffprobePath}`);
          }
      }
    } else {
      return path;
    }
  }
}