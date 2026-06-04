import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // bu qatorsiz NestJS bu fileni aynan Controller mantig'i yozilgan file ekanligini bilmaydi
export class AppController {
  constructor(private readonly appService: AppService) {} // dependency injection

  @Get() // = @Get("/") va bu API(endpoint)
  getHello(): string {
    return this.appService.getHello();
  }
}
