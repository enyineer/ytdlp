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