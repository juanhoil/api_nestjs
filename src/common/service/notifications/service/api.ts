import axios from 'axios';
const url = 'https://webservice.dirtytalks.club';
//const url = 'http://localhost:3000'

export const httpCientNotifications = axios.create({
    baseURL: url,
    headers: {
        "Content-Type": "application/json"
    }
});
/*

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
class httpCientNotifications {
  private static classInstance?: httpCientNotifications;
  private postcodeRegex
  protected readonly instance: AxiosInstance;
  private readonly configService: ConfigService

  constructor() {
    this.postcodeRegex = this.configService.get<string>('notification.url');

    if (!this.postcodeRegex) {
      throw new Error(`Regex postcode validation required`);
    }

    console.log(this.postcodeRegex)

    this.instance = axios.create({
        baseURL: this.postcodeRegex,
        headers: {
            'Content-Type': 'application/json',
        },
    });
  }

  public static getInstance() {
    if (!this.classInstance) {
      this.classInstance = new httpCientNotifications();
    }
    return this.classInstance;
  }


  public post(endpoint: string, data?: any) {
    return this.instance.post(`${endpoint}`, data);
  }
}
export default httpCientNotifications*/