import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class MailService {
  tranporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
      user: config.EMAIL_USER,
      pass: config.APP_PASSWORD,
    },
  });

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    await this.tranporter.sendMail({
      from: config.EMAIL_USER,
      to,
      subject,
      text,
    });
  }

  async sendHtmlMail(to: string, subject: string, html: string): Promise<void> {
    await this.tranporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });
  }
}
