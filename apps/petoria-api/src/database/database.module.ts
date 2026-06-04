import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose'; // MongoDB ulanish obyektini inject qilib beruvchi decorator / NestJS da MongoDBni sozlash uchun NestJSning o'z wrapperi
import { Connection } from 'mongoose'; //  mongoose ichida yozilgan class. MongoDBga ulanish, uzilish, holat tekshirish kabi barcha mantiq shu class ichida yozilgan.

@Module({ // NestJS da — Databasega ulanish uchun mas'ul modul.
	imports: [ // Boshqa modullardan kelgan narsalarni shu modulga kiritish uchun.
		MongooseModule.forRootAsync({ // database ulanishidan oldin biror narsa kutish kerak bo'lsa. Bu yerda .env faylidan o'zgaruvchilarni o'qishi va ular tayyor bo'lguncha kutish kerak
			useFactory: () => ({ // OPTION: Sozlamalarni funksiya orqali qaytaradi. Oddiy object yozish o'rniga funksiya ishlatiladi
				uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV, // .env fayldan MODE_ENV ni o'qiydi va production bo'lsa — real baza manzilini oladi vs. boshqa bo'lsa — test baza manzilini oladi
			}),
		}),
	],
	exports: [MongooseModule], // Shu modulda sozlangan narsalarni boshqa modullarga ham berish uchun.
})
export class DatabaseModule {
	constructor(@InjectConnection() private readonly connection: Connection) { // "NestJS, menga MongoDB ulanish obyektini ber": avtomatik instance olib beradi: const connection = new Connection()
		// private — faqat shu class ichida ishlatiladi; readonly — bir marta berilgandan keyin o'zgartirib bo'lmaydi.
		if (connection.readyState === 1) { // Ulanish holati tekshiriladi: 1 — ulangan
			console.log(
				`Mongoose is connected into ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} db`,
			);
		} else {
            console.log("DB is not connected!");
        }
	}
}
// Bu modul loyiha ishga tushganda .env dan to'g'ri baza manzilini olib, MongoDB ga ulanadi va ulanish natijasini consolega chiqaradi.
