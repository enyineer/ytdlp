// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest } from 'next';
import { FFMPEG } from '../../core/ffmpeg';
import { YTDLP } from '../../core/ytdlp';
import { z } from 'zod';
import { timemarkToSeconds, validate } from './_utils';
import { PassThrough } from 'stream';
import { getSocket, NextApiResponseServerIO } from './socketio';
import { createId } from '@paralleldrive/cuid2';
import storage from '../../core/storage';

const ytdlp = new YTDLP();
const ffmpeg = new FFMPEG();

export type DownloadProgress = {
  ytdlp: {
    value: number;
  }
  ffmpeg: {
    value: number;
  }
}

export type DownloadEvent = 'end' | 'error';

const schema = z.object({
  query: z.object({
    url: z.string().url('Must be a URL.'),
  }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== 'GET') {
    return res.status(405).send({
      message: 'Only GET operations are allowed.',
    });
  }

  const data = await validate(schema, req, res);

  if (!data) {
    return;
  }

  const url = data.query.url;

  try {
    const info = await ytdlp.getInfo(url);
    const duration = Math.floor(info.duration);

    if (typeof duration !== 'number' || Number.isNaN(duration) || duration > 600) {
      return res.status(400).send({
        message: 'Video not supported - Max video length is 10 Minutes.',
      });
    }

    const passthrough = new PassThrough();

    let ytdlProgress = 0;
    let ffmpegProgress = 0;

    const ytdlStream = ytdlp.downloadStreamable(url);

    const socket = getSocket(res);
    const ticket = createId();

    const updateProgress = () => {
      const downloadProgress: DownloadProgress = {
        ffmpeg: {
          value: Math.ceil(ffmpegProgress),
        },
        ytdlp: {
          value: Math.ceil(ytdlProgress),
        },
      };
      socket.to(`ticket-${ticket}`).emit(`progress-${ticket}`, downloadProgress);
    }

    ytdlStream.on('data', (chunk) => {
      passthrough.write(chunk);
    });

    ytdlStream.on('progress', (progress) => {
      ytdlProgress = progress.percent || 0;
      updateProgress();
    });

    ytdlStream.on('end', () => {
      passthrough.end();
    });

    ytdlStream.on('error', (err) => {
      socket.to(`ticket-${ticket}`).emit(`event-${ticket}`, 'error');
      console.error(`Error in ytdlStream: ${err.message}`);
    });

    const ffmpegWritable = ffmpeg.convertStreamable(passthrough);
    
    ffmpegWritable.on('progress', (progress) => {
      const timemarkSeconds = timemarkToSeconds(progress.timemark);
      if (timemarkSeconds !== null) {
        const durationProgress = (timemarkSeconds / duration) * 100;
        if (durationProgress <= 100) {
          ffmpegProgress = (timemarkSeconds / duration) * 100;
        }
      }
      updateProgress();
    });

    ffmpegWritable.on('end', () => {
      socket.to(`ticket-${ticket}`).emit(`event-${ticket}`, 'end');
    });

    ffmpegWritable.on('error', (err) => {
      socket.to(`ticket-${ticket}`).emit(`event-${ticket}`, 'error');
      console.error(`Error in ffmpegWritable: ${err.message}`);
    });

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${info.title}.mp3"`,
      'X-Download-Ticket': ticket,
    });

    const downloads = (await storage.getItem('downloads')) || 0;
    await storage.setItem('downloads', downloads + 1);

    ffmpegWritable.pipe(res);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    
    return res.status(400).send({
      message: 'Invalid URL.',
    });
  }
}

export const config = {
  api: {
    responseLimit: '30mb',
  },
}
