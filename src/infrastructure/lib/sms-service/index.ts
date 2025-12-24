import { mobizon } from 'mobizon-node';
import { config } from 'src/config';

mobizon.setConfig({
  apiKey: config.MOBIZON_KEY,
  apiServer: config.MOBIZON_URL,
  format: 'json',
});

export default mobizon;
