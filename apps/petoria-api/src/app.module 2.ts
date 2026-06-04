import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // .env file mantig'ini NestJSda ishlashi un yordam beradigan mantiq
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';

@Module({
	imports: [
		ConfigModule.forRoot(), // external module
		GraphQLModule.forRoot({ // GraphQL ni sozlaydi:
			driver: ApolloDriver, // GraphQL ishlashi uchun engine (runtime executor)
			playground: true, // Brauzarda GraphQL so'rovlarini sinab ko'rish uchun UI ochiladi
			uploads: false, // GraphQL orqali fayl yuklash o'chirilgan, fayl yuklash alohida maxsus sozlash talab qilganligi un
			autoSchemaFile: true, // GraphQL schemani playgroundda avtomatik yaratadi
			formatError: (error: T) => { // GraphQL serverida sodir bolgan ixtiyoriy errorni biz yaratgan customized error sifatida olib beradi
				const graphQLFormattedError = { // errorni formatlashtirish jarayoni: 2ta narsani jamlaydi: CODE & MESSAGE
					code: error?.extensions.code,
					message:
						error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message, // 3 turdagi holat errodagi messageni qabul qiladi
				};
				console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);
				return graphQLFormattedError; // server qotib qolmasligi un return qildik
			},
		}),
		ComponentsModule, // HTTP: Loyihaning Backendini asosiy mantig'i / business logic moduli(Service).
		DatabaseModule, // TCP[doimiy bog'lanish]: MongoDB Databasega ulanish moduli.
	],
	controllers: [AppController], // [Rest API] HTTP so'rovlarni qabul qiladi (REST API uchun)
	providers: [AppService, AppResolver], // [GraphQL API] Dependency Injection: ichidagilar boshqa joylarda inject qilib ishlatilaveradi
}) // rest & graphql api ham http ustiga qurilganligi un bir-birini rad etmaydi 
export class AppModule {} // JSni oddiy classi[state, constructor, method, extends] ->  Module decorater[@Module] orqali boyitilgan class
// 