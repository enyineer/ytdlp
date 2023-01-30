import { existsSync } from 'fs';
import YTDLPWrapper from 'yt-dlp-wrap';
import commandExists from 'command-exists';

type Params = {
  binaryPath?: string;
}

export class YTDLP {
  private readonly ytdlp: YTDLPWrapper;

  constructor(params?: Params) {
    this.ytdlp = new YTDLPWrapper(this.getBinaryPath(params?.binaryPath));
  }

  downloadStreamable(video: string) {
    return this.ytdlp.execStream([
      video,
    ]);
  }

  async getInfo(video: string) {
    return await this.ytdlp.getVideoInfo(video);
  }

  private getBinaryPath(path?: string) {
    if (!path || !existsSync(path)) {
      if (process.platform === 'win32') {
        return 'binaries/yt-dlp.exe';
      }

      const ytdlpPath = '/usr/bin/yt-dlp';
      if (commandExists.sync('yt-dlp')) {
        return ytdlpPath;
      } else {
        throw new Error(`Path ${path} does not exist and yt-dlp is not installed at ${ytdlpPath}`);
      }
    } else {
      return path;
    }
  }
}