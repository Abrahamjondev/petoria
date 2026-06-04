import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import LikeSchema from '../../schemas/Like.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			// DBni alohida ulab oldik va Database Connection mantig'i bn Schemani bog'ladik
			{
				name: 'Like', // shu nom ostida yoziladi
				schema: LikeSchema, // object -> model; shu nom bn export qilingan schema Model
			},
		]),
		// AuthModule, // both => member moduleni qurishda yordam beradigan boshqa modulelarni chaqirib oldik
		// ViewModule, //
	],
	providers: [LikeService], // LikeModule -> boshqa modulelarni mantig'i uchun xizmat qiladi
	exports: [LikeService],
})
export class LikeModule {}
