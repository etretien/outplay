import { Injectable, Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailingService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // generated ethereal user
        pass: process.env.SMTP_PASSWORD, // generated ethereal password
      },
    } as nodemailer.TransportOptions);
  }

  async sendEmail(to: string, subject, html: string, text: string) {
    return await this.transporter.sendMail({
      from: `"Outplay" <${process.env.SMTP_USER}>`, // sender address
      to,
      subject,
      text,
      html,
    });
  }
}

@Module({
  providers: [MailingService],
})
export class Mailing {}
