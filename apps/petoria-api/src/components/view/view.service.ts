import { Injectable } from '@nestjs/common';
import { View } from '../../libs/dto/view/view';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { Products } from '../../libs/dto/product/product';
import { lookupVisit } from '../../libs/config';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {} // viewModuleda import qilingan schemani inject qilib ishlatdik va instance oldik

	public async recordView(input: ViewInput): Promise<View | null> { // view hosil bolsa | hosil bolmasa
		const viewExist = await this.checkViewExistence(input); // checkViewExistencedan kelayotgan inputni joyladik
		if (!viewExist) {
			console.log('- New View insert -');
			return await this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input; // destruction
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec(); // search ichidagi qiymatlarini joyladik
	}

	public async getVisitedProducts(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> { // Metod boshlanishi: ko'rilgan productlarni qaytaradi
		const { page, limit } = input; // Inputdan sahifa raqami va miqdorni ajratib olish
		const match: T = { viewGroup: ViewGroup.PRODUCT, memberId: memberId }; // Faqat 'PRODUCT' turidagi va foydalanuvchiga tegishli ko'rishlarni filtrlash

		const data: T = await this.viewModel // 'views' kolleksiyasida qidiruvni boshlash
			.aggregate([
				// Aggregation pipeline (murakkab so'rov) boshlanishi
				{ $match: match }, // Shartga mos ko'rishlarni ajratib olish
				{ $sort: { updatedAt: -1 } }, // Oxirgi ko'rilganlarni vaqt bo'yicha yuqoriga qo'yish
				{
					$lookup: { // 'products' kolleksiyasi bilan bog'lanish
						from: 'products', // [2] 'products' collectiondagi
						localField: 'viewRefId', // [1] 'viewRefId' dagi valueni olib
						foreignField: '_id', // [3] aynan '_id' si 'viewRefId'bilan bir xil bo'lganini topgach
						as: 'visitedProduct', // [4] Natijani 'visitedProduct' nomi ostida saqlash
					},
				},
				{ $unwind: '$visitedProduct' }, // Lookupdan kelgan arrayni objectga aylantirish
				{
					$facet: { // Bittada ikki xil aggregation:
						list: [ // 1-operatsiya: Ma'lumotlar ro'yxatini shakllantirish
							{ $skip: (page - 1) * limit }, // Avvalgi sahifalardagi ma'lumotlarni tashlab o'tish
							{ $limit: limit }, // Hozirgi sahifa uchun belgilangan miqdorni olish
							lookupVisit, // Product Agentining ma'lumotlarini olib kelish (external pipeline)
							{ $unwind: '$visitedProduct.memberData' }, // Product egasi ma'lumotini massivdan obyektga o'girish
						],
						metaCounter: [{ $count: 'total' }], // 2-operatsiya: Jami topilgan hujjatlar sonini hisoblash
					},
				},
			])
			.exec(); // So'rovni ijro etish

		const result: Products = { list: [], metaCounter: data[0].metaCounter }; // Yakuniy natija strukturasini yaratish
		result.list = data[0].list.map((ele) => ele.visitedProduct); // Murakkab strukturadan faqat product ma'lumotlarini ajratib olish

		return result; // Tayyor ma'lumotni qaytarish
	}
}
