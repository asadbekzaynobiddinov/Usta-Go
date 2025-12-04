import { Infobip, AuthType } from '@infobip-api/sdk';
import { config } from 'src/config';

export const infobipClient = new Infobip({
  baseUrl: config.INFOBIP_URL,
  apiKey: config.INFOBIP_API,
  authType: AuthType.ApiKey,
});
