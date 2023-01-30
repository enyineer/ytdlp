// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { FFMPEG } from '../../core/ffmpeg';
import { YTDLP } from '../../core/ytdlp';
import { z } from 'zod';
import { validate } from './_utils';

const ytdlp = new YTDLP();
const ffmpeg = new FFMPEG();

const schema = z.object({
  query: z.object({
    url: z.string().url('Must be a URL.'),
  }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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

    const ytdlStream = ytdlp.downloadStreamable(url);
    const readableStream = ffmpeg.convertStreamable(ytdlStream);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${info.title}.mp3"`
    });

    readableStream.pipe(res);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    
    return res.status(400).send({
      message: 'Bad URL / Request',
    });
  }
}

export const config = {
  api: {
    responseLimit: '30mb',
  },
}
