import { Module } from '@nestjs/common';
import { FollowResolver } from './follow.resolver';
import { FollowService } from './follow.service';
import FollowSchema from '../../schemas/Follow.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			// DBni alohida ulab oldik va Database Connection mantig'i bn Schemani bog'ladik
			{
				name: 'Follow', // shu nom ostida yoziladi
				schema: FollowSchema, // object -> model; shu nom bn export qilingan schema Model
			},
		]),
		AuthModule, // both => member moduleni qurishda yordam beradigan boshqa modulelarni chaqirib oldik
		MemberModule, //
	],
	providers: [FollowResolver, FollowService], // LikeModulega xizmat qiluvchi asosiy mantiqlar
	exports: [FollowService],
})
export class FollowModule {}
