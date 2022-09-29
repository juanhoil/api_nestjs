import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  constructor(private httpService: HttpService) {}

  async sendVerificationRecaptcha({ secret, response }: { secret: string, response: string, remoteip?: string }) {
    return this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`, {}, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
    });
  }
}