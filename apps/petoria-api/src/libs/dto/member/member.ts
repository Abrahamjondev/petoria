import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { MeLiked } from '../like/like';
import { MeFollowed } from '../follow/follow';

@ObjectType() // Backenddan Frontendga chiqib ketayotgan DTO
export class Member {
	@Field(() => String)
	_id: ObjectId; // Backendda Databasega aynan ObjectId korinishida yoziladi

	@Field(() => MemberType) // Field, GraphQL unsuri bn ishlata oldik, sababi, MemberType enumida register mantig'i orqali enumlarni GraphQLda ishlatishga imkon bergandik
	memberType: MemberType; // TypeScriptga type integrationini amalga oshirdik

	@Field(() => MemberStatus) // MemberStatus enumlaridan malumot olsin
	memberStatus: MemberStatus;

	@Field(() => MemberAuthType)
	memberAuthType: MemberAuthType;

	@Field(() => String, { nullable: true })
	memberPhone?: string;

	@Field(() => String) // GraphQLga tegishli
	memberNick: string; // Schemaga tegishli

	memberPassword?: string; // Fieldga biriktirmadik, sababi GraphQL tashqariga chiqarib yubormasligi kk

	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@Field(() => String)
	memberImage: string; // default: '' qilganimiz uchun nullable qilmadik

	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;

	@Field(() => Int)
	memberProducts: number;

	@Field(() => Int)
	memberArticles: number;

	@Field(() => Int)
	memberFollowers: number;

	@Field(() => Int)
	memberFollowings: number;

	@Field(() => Int)
	memberPoints: number;

	@Field(() => Int)
	memberLikes: number;

	@Field(() => Int)
	memberViews: number;

	@Field(() => Int)
	memberComments: number;

	@Field(() => Int)
	memberRank: number;

	@Field(() => Int)
	memberWarnings: number;

	@Field(() => Int)
	memberBlocks: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;

	/** from aggregation **/
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType() // getAgentsda agent datalarini olayotganda kk boladi
export class Members {
	@Field(() => [Member]) // GaphQL sintaksisi
	list: Member[]; // memberlardan iborat arraylarni qaytaradi

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
