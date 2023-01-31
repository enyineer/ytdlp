import { readFileSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { resolve } from 'path';

const supportedSites = readFileSync(resolve('info/supportedsites.md')).toString().replace('# Supported sites\n', '');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(supportedSites.toString());
}