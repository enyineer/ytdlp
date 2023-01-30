import { NextApiRequest, NextApiResponse } from 'next';
import { ZodObject, ZodRawShape } from 'zod';

export const validate = async <T extends ZodRawShape>(schema: ZodObject<T>, req: NextApiRequest, res: NextApiResponse) => {
  try {
    return await schema.parseAsync({
      body: req.body,
      query: req.query,
    });
  } catch (error) {
    res.status(400).json(error);
    return null;
  }
}

export const timemarkToSeconds = (timemark: string) => {
  const regex = /(\d+):(\d+):(\d+)\.(\d+)/g;

  const matches = regex.exec(timemark);

  if (!matches) {
    return null;
  }

  const hours = parseInt(matches[1]);
  const minutes = parseInt(matches[2]);
  const seconds = parseInt(matches[3]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds)
  ) {
    return null;
  }

  const inSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;

  return inSeconds;
}