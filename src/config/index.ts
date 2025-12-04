import * as dotenv from 'dotenv';

dotenv.config();

export type ConfigType = {
  API_PORT: number;
  DB_URL: string;
  ACCESS_TOKEN_KEY: string;
  ACCESS_TOKEN_TIME: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  APP_PASSWORD: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  INFOBIP_API: string;
  INFOBIP_URL: string;
};

export const config: ConfigType = {
  API_PORT: parseInt(process.env.API_PORT as string, 10),
  DB_URL: process.env.DB_URL as string,
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY as string,
  ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME as string,
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT as string, 10),
  EMAIL_USER: process.env.EMAIL_USER as string,
  APP_PASSWORD: process.env.APP_PASSWORD as string,
  CLIENT_ID: process.env.CLIENT_ID as string,
  CLIENT_SECRET: process.env.CLIENT_SECRET as string,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: parseInt(process.env.REDIS_PORT as string, 10),
  INFOBIP_API: process.env.INFOBIP_API as string,
  INFOBIP_URL: process.env.INFOBIP_URL as string,
};
