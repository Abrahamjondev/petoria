import { Injectable } from '@nestjs/common';

@Injectable() // ushbu classni inject qilib, boshqa joyda ishlatish mn, xuddi instance olgandek
export class AppService {
  getHello(): string {
    return 'Welcome to Petoria API Server!';
  }
}
