import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { lookupAuthMemberLiked } from '../../libs/config';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private authService: AuthService, // memberModuleda import qilingan boshqa modulelardan instance olindi
		private viewService: ViewService, // endi olingan instance bn ishlatish mn
		private likeService: LikeService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		// Hash password
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		/* MemberSchema orqali hosil bolayotgan create static methodini errori standard emas, mongoose serverni errori va 
directly clientga yuborilmasligi kkligi un, yani shunday maxsus holda try/catchga wrap qilib ozimizni errorlarimizga ogirib olishimiz kk*/
		try {
			const result = await this.memberModel.create(input);
			// TODO: Authentification via TOKEN
			result.accessToken = await this.authService.createToken(result);
			// console.log('accessToken:', accessToken );

			return result;
		} catch (err: any) {
			console.log('Error, Service.model', err.message);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input; // destruction
		const response: Member = await this.memberModel
			.findOne({ memberNick: memberNick }) // memberNickni topsin
			.select('+memberPassword') // databsedan bydefault olib bermasdi, majburlab chaqirib oldik, match qilish un
			.exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK); // No member nick dedik, delete emas, sababi ochirib chiqib ketsa ham databasedan o'chmaydi va buni aytib qoymaslik kk
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		// Comparing passwords
		const isMatch = await this.authService.comparePasswords(
			memberPassword, // damir2020
			response.memberPassword,
		); // hbcoewiubqoiacubd
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
		response.accessToken = await this.authService.createToken(response);
		return response;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE, // faqat ACTIVE member datasini ozgartira oladi
				},
				input, // FDdan kelgan input
				{ new: true }, // yangilangan datani qaytaradi
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED); // yangilangan mantiq mavjud bolmasa

		result.accessToken = await this.authService.createToken(result); // accessTokenni expiry dateni yangilab oladi, FDda accessToken ichidagi member datasidan foydalanganimiz un payloaddagi eng songgi malumotlar kk boladi

		return result;
	}

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		// [memberId] => tomosha qilayotgan user, [targetId] => malumotlari korilayotgan user
		const search: T = {
			_id: targetId, // tekshirilayotgan user idsi orqali malumotni DBdan qabul qiladi
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK], // DELETE bolgan user datasi DBda turganini userlar bilmasligi kk,
			},
		};

		// lean -> JS ojectga aylantirib beradi
		const targetMember = await this.memberModel.findOne(search).lean().exec(); // const searchga kiritilgan data bn DBdan malumot qidiramiz
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND); // qidirilgan member malumotlari chiqmasa

		if (memberId) {
			// user datasini korish un req. qilgan member[faqat AuthMemberlar uchun], tekshirilayotgan userga + 1 view
			const viewInput: ViewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER }; // boyitdik: kim tomosha qildi, kimni tomosha qildi, Group ichidan aynan MEMBER tomosha qilinyapti
			const newView = await this.viewService.recordView(viewInput); // recordView ishga tushib yangi view hosil bolsa
			if (newView) {
				// viewServiceda yangi view hosil bolsa
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec(); // yuqoridagi searchni topsin, va memberViewsni +1ga increase qilsin va yangilangan datani qaytaradi
				targetMember.memberViews++; // API yangilashi un; yuqoridagi targetMemberni viewsini +1ga kopaytiradi
			}

			// meLiked
			const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
			targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);
			//meFollowed
			targetMember.meFollowed = (await this.checkSubscription(memberId, targetId)) as any;
		}
		return targetMember;
	}
	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();
		return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
	}

	public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
		const { text } = input.search; // destruction: search un yoziladigan textni qabul qildik
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE }; // ACTIVE holatdagi AGENTlarnigina oladi
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // aggregation un kk boladigan objectlar
		// [member.input.tsda optional edi]bor bolsa, inputdagi sortdan ol, bolmasa bydefault createdAt; inputdagi directiondan ol, bolmasa DESC[yuqoridan pastga]

		if (text) match.memberNick = { $regex: new RegExp(text, 'i') }; // text bo'lsa, matchdagi memberNickdan qidiramiz
		console.log('match', match);

		const result = await this.memberModel // MongoDB aggregation pipeline:
			.aggregate([
				{ $match: match }, // filterlash (faqat active + agentlar)
				{ $sort: sort }, // natijani yuqoridagi tartib boyicha tartiblash
				{
					$facet: {
						// pagination: aggregationda bir nechta pipelinelarni querysini bir vaqtda foydalana olish un
						// skip => oldingi sahifalardagi elementlarni tashlab o‘tadi; limit => hozirgi sahifa uchun kerakli miqdorni oladi
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }, 
							lookupAuthMemberLiked(memberId),
						], 
						metaCounter: [{ $count: 'total' }], // total nomi ostida jami AGENTlar soni
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0]; // $facet natijasi array ichida keladi, shuning uchun birinchi element olinadi
	}

	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
		const target: Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER,
		};

		// LIKE TOGGLE via Like modules
		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search; // admin bergan filterlar (ixtiyoriy)
		const match: T = {}; // adminga barcha memberTypelar olib beriladi
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // inputdan kelgan qiymatlar, bolmasa (default: createdAt DESC)

		if (memberStatus) match.memberStatus = memberStatus; // agar memberStatus bo'lsa, qiymatini matchdagi MemberStatusga biriktir
		if (memberType) match.memberType = memberType; // memberType qiymati bolsa matchdagi MemberTypega olib beradi
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') }; // text bolsa textni olib beradi; i => case insensitive
		console.log('match', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					}, // aggregationda bir nechta pipelinelarni querysini bir vaqtda foydalana olish un
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0]; // $facet natijasi array ichida keladi, shuning uchun birinchi element olinadi
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		// update/options
		const result: Member = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec(); // _id: qaysi member update bolyapti, qanday dataga yangilandi, updated version
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		console.log('Executed!');

		const { _id, targetKey, modifier } = input; // Kirish ma'lumotlarini ajratib olish (Destructuring)

		return await this.memberModel
			.findByIdAndUpdate(
				_id, // Qaysi ID li foydalanuvchini yangilaymiz?
				{
					// $inc - mavjud songa modifierni (+1 yoki -1) qo'shadi
					// [targetKey] - dynamic kalit: ['memberProperties' & 'memberLikes']
					$inc: { [targetKey]: modifier },
				},
				{ new: true }, // Yangilangandan keyingi datani qaytaradi
			)
			.exec(); // So'rovni bazaga yuborishni yakunlash
	}
}
