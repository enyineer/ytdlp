import storage from "node-persist"
import { resolve } from 'path';

storage.init({
  dir: resolve('storage'),
});

export default storage;