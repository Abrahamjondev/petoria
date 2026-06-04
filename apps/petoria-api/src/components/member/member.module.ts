import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';
import FollowSchema from '../../schemas/Follow.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			// DBni alohida ulab oldik va Database Connection mantig'i bn Schemani bog'ladik
			{
				name: 'Member', // shu nom ostida yoziladi
				schema: MemberSchema, // object -> model; shu nom bn export qilingan schema Model
			},
		]),
		MongooseModule.forFeature([
			// DBni alohida ulab oldik va Database Connection mantig'i bn Schemani bog'ladik
			{
				name: 'Follow', // shu nom ostida yoziladi
				schema: FollowSchema, // object -> model; shu nom bn export qilingan schema Model
			},
		]),
		AuthModule, // both => member moduleni qurishda yordam beradigan boshqa modulelarni chaqirib oldik
		ViewModule, //
		LikeModule,
	],
	providers: [MemberResolver, MemberService], // MemberModulega xizmat qiluvchi asosiy mantiqlar
	exports: [MemberService],
})
export class MemberModule {}
