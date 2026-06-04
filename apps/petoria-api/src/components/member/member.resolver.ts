import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';

import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';
import type { ObjectId } from 'mongoose';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {} // DI
	@Mutation(() => Member)
	// @UsePipes(ValidationPipe) // DTO
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		// Member DTO qiymatdagi data yuborishi kk: kirib kelayotgan Argumentimizni input qilib belgiladik
		console.log('Mutation: signup');
		console.log('input:', input);
		return await this.memberService.signup(input); // call
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		// LoginInput DTOsi bn belgiladik
		console.log('Mutation: login');
		return await this.memberService.login(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query: checkAuth');
		console.log('memberNick:', memberNick);
		return `Hi ${memberNick}`;
	}

	@Roles(MemberType.USER, MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		// Custom[param] decorator
		console.log('Query: checkAuthRoles');
		return `Hi ${authMember.memberNick}! You are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	// Authenticated: AGENT, ADMIN, USER
	@UseGuards(AuthGuard)
	@Mutation(() => Member) // ObjectTypedagi datani qaytarish kk
	public async updateMember(
		@Args('input') input: MemberUpdate, // memberupdate typeni argument decorator orqali qabul qildik
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation: updateMember');
		delete input._id; // memberupdate typeda _id ham kirib kelsin deyilgandi, o'shani ochirdik, sababi _idni yuqorida AuthMember orqali allaqachon olib bolganmiz
		return await this.memberService.updateMember(memberId, input); // memberId - AuthMemberdan kirib kelayotgani, input - _idsi delete qilingan MemberUpdatedan kirib kelyapti
	}

	// bir member (login bolgan/bolmagan) boshqa userni kora oladi
	@UseGuards(WithoutGuard) // memberId: null qaytarib, shunchaki otkazib yuboradi
	@Query(() => Member) // qaytarayotgan natija Member korinishida
	public async getMember(
		@Args('memberId') input: string, // FDdan keladi: boshqa tekshirilayotgan user
		@AuthMember('_id') memberId: ObjectId, // authMember orqali kiradi va aynan qaysi user ko'rmoqchi; statistika: tekshirilayotgan userni aynan AuthMemberdan otgan user bir martta tomosha qildi
	): Promise<Member> {
		console.log('Query: getMember');
		const targetId = shapeIntoMongoObjectId(input); // FDdan barcha member data keladi, lekin id=string boladi va ObjectIdga o'girildi
		return await this.memberService.getMember(memberId, targetId); // tekshirayotgan va tekshirilayotgan user faqat IDlari asosida service ichida ruxsat va data olish amalga oshadi
	}

	@UseGuards(WithoutGuard)
	@Query(() => Members)
	public async getAgents(@Args('input') input: AgentsInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Members> {
		console.log('Query: getAgents');
		return await this.memberService.getAgents(memberId, input); // kim AGENTlarni koryapti &
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async likeTargetMember(
		@Args('memberId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation: likeTargetMember');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.memberService.likeTargetMember(memberId, likeRefId);
	}

	/** ADMIN **/
	// Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		console.log('Query: getAllMembersByAdmin');
		return await this.memberService.getAllMembersByAdmin(input);
	}

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		console.log('Mutation: updateMemberByAdmin');
		return await this.memberService.updateMemberByAdmin(input);
	}

	/** UPLOADER **/
	@UseGuards(AuthGuard) // Faqat login qilgan foydalanuvchilarga ruxsat beradi
	@Mutation((returns) => String) // Natija sifatida yuklangan rasm URL'ini (string) qaytaradi
	public async imageUploader(
		@Args({ name: 'file', type: () => GraphQLUpload }) // user oddiy matn (string) emas, balki fayl yuboryapti
		{ createReadStream, filename, mimetype }: FileUpload, // file datani destruction qilib olish:
		// Faylni ochish va bo'laklab o'qish un, faylning asl nomi, jpeg/png
		@Args('target') target: String, // Rasmni saqlash manzili; Postmanda target: "member" qiymati bor
	): Promise<string> {
		console.log('Mutation: imageUploader');

		if (!filename) throw new Error(Message.UPLOAD_FAILED);
		const validMime = validMimeTypes.includes(mimetype); // Manual Validation: Fayl turini (jpeg, png) tekshirish
		if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

		const imageName = getSerialForImage(filename); // Faylga (unique) nom berish (jhefbwefgc.jpg)
		const url = `uploads/${target}/${imageName}`; // Faylning serverdagi virtual yo'lini shakllantirish, target o'rniga postmandagi member qiymati tushadi va rasm avtomatik uploads/member/ papkasiga boradi.
		const stream = createReadStream(); // faylni oladi-yu, hammasini birdaniga emas bo'laklab beradi [10MB => 64kb - 64kb..]

		// Rasmni diskka (physical storage) yozish jarayoni
		const result = await new Promise((resolve, reject) => {
			// Fayl to'liq yozib bo'linmaguncha kutishni ta'minlaydi:
			stream
				.pipe(createWriteStream(url)) // O'qilayotgan faylni belgilangan URL'ga yozishni boshlash
				.on('finish', async () => resolve(true)) // Yuklash muvaffaqiyatli yakunlansa true qaytarish
				.on('error', () => reject(false)); // Yuklashda xato bo'lsa false qaytarish
		});
		if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);

		return url; // Frontendga rasmning saqlangan manzilini (URL) qaytarish
	}

	/** MULTI-UPLOADER - Bir nechta rasmlarni parallel yuklash **/
	@UseGuards(AuthGuard)
	@Mutation((returns) => [String]) // rasmlar manzillaridan iborat ro'yxat qaytadi: ["url1", "url2", ...]
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] }) // shorthand: files nomi ostida
		files: Promise<FileUpload>[], // Array of Promises: bir nechta rasmlar, fayllar to'liq yetib kelmagan, kutish kk
		@Args('target') target: String,
	): Promise<string[]> {
		console.log('Mutation: imagesUploader');

		const uploadedImages = []; // Yuklangan rasmlar URL'larini yig'ish un
		// Har bir fayl uchun yuklash jarayonini (Promise) yaratish
		const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
			try {
				const { filename, mimetype, createReadStream } = await img; // 1-rasm datasi bn kelguncha va datasi destruction bolguncha 2-fileni toxtatib turadi

				const validMime = validMimeTypes.includes(mimetype); // Manual Validation: Fayl turini (jpeg, png) tekshirish
				if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

				const imageName = getSerialForImage(filename); // Faylga (unique) nom berish (jhefbwefgc.jpg)
				const url = `uploads/${target}/${imageName}`; // Faylning serverdagi virtual yo'lini shakllantirish, target o'rniga postmandagi member qiymati tushadi va rasm avtomatik uploads/member/ papkasiga boradi
				const stream = createReadStream(); // faylni oladi-yu, hammasini birdaniga emas bo'laklab beradi [10MB => 64kb - 64kb..]

				const result = await new Promise((resolve, reject) => {
					// Fayl to'liq yozib bo'linmaguncha kutishni ta'minlaydi:
					stream
						.pipe(createWriteStream(url)) // O'qilayotgan faylni belgilangan URL'ga yozishni boshlash
						.on('finish', () => resolve(true)) // Yuklash muvaffaqiyatli yakunlansa true qaytarish
						.on('error', () => reject(false)); // Yuklashda xato bo'lsa false qaytarish
				});
				if (!result) throw new Error(Message.UPLOAD_FAILED);

				uploadedImages[index] = url; // index orqali saqlash — tartib belgilash. index bolmasa, hajmi kichik rasm (hajmi kattadan keyin yuborilsa ham) tezroq yuklanadi va 1-o'ringa o'tib, tartibni buzadi
			} catch (err) {
				console.log('Error, file missing!');
			}
		});

		await Promise.all(promisedList); // Ro'yxatdagi hamma rasmlar yuklansin, keyingi qatorga keyin
		return uploadedImages;
	}
}
/** 
Stream (Oqim): Fayl RAM'ni to'ldirib yubormasligi uchun u bo'lak-bo'lak (stream) qilib o'qiladi va yoziladi.
Pipe: O'qish oqimi (ReadStream) va yozish oqimi (WriteStream) o'rtasidagi bog'lovchi zanjir.
Server 10MB-lik rasm uchun 10MB xotira ishlatmaydi, har safar faqat o'sha kichik 64kb-lik "konveyer" ustidagi bo'lakni ko'rib turadi xolos.
"10MB rasm createReadStream orqali kichik bo'laklarga (odatda 64 KB li chunk'larga) bo'lib o'qiladi. 
Har bir bo'lak PIPE orqali writeStreamga uzatiladi va diskka navbatma-navbat yoziladi. Bu butun fayl (10 MB) to'liq uzatilguncha davom etadi."
**/