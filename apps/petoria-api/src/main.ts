import { NestFactory } from '@nestjs/core'; // class NestJS ilovasini yaratish uchun ishlatiladi.
import { AppModule } from './app.module'; // Barcha boshqa modullar yig'ilgan asosiy module
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import path from 'path';
import { WsAdapter } from '@nestjs/platform-ws';

// Global Integration
async function bootstrap() {
	// define: baza ulanishi, port tinglashini kutish kerak
	// MIDDLEWARE
	const app = await NestFactory.create(AppModule); // NestJS ilovasini yaratadi va asosiy ingredient. AppModuleni beramiz: "shu moduldan boshlab ilovani qur" Express + NestJS
	app.useGlobalPipes(new ValidationPipe()); // Pipe Validation Global integration: ValidationPipe instance argument sifatida paste boldi
	app.useGlobalInterceptors(new LoggingInterceptor()); // log data Global integration
	app.enableCors({ origin: true, credentials: true }); // So'rov bn birga JWT token va Cookielar serverga o'tishini ta'minlaydi;
	// Turli manzillardagi FD va BDdagi so'rovlarga (CORS blokirovkasiz) ruxsat beradi.

	app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 })); // JSON data orasida kelayotgan rasm fayllarini ajratib, ularni foydalanishga tayyorlab beradi; 15MB & 10tagacha
	app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // 1. [/uploads] Brauzerdagi URL manzili (Virtual yo'l)
	app.useWebSocketAdapter(new WsAdapter(app));
	await app.listen(process.env.PORT_API ?? 3000); // envdagi portda sorovlarni tinglasin, port belgilanmagan bolsa 3000.
}
bootstrap(); // call NestJS EXPRESS ustiga qurilgan Framework
// loyihaning kirish nuqtasi: NestJS ilovasini yaratadi, portga ulaydi va ishga tushiradi.
/** 
/uploads - Brauzerdagi URL manzili (Virtual yo'l); uploads - rasm turgan papka nomi
process.cwd() — "qaysi loyiha papkasida bo'lsang, o'sha joyning manzilini ol": C:/projects/petoria
path.join(..., 'uploads') — O'sha loyiha manzili oxiriga /uploads so'zini ulaydi va rasmlar turgan papkaning to'liq manzili (path) hosil bo'ladi.
express.static(...) — Shu manzildagi rasmlarni URL orqali so'rasa FDda ko'rsatadi
**/