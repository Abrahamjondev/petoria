import { Schema } from 'mongoose';
import { ProductGender, ProductSpecies, ProductStatus, ProductType } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			enum: ProductType,
			required: true, // user bu datani aniq kiritsin
		},

		productStatus: {
			type: String,
			enum: ProductStatus,
			default: ProductStatus.ACTIVE, // product yaratganda unga tegishli statusini user belgilamasa avtomatik ACTIVE qiladi
		},

		productSpecies: {
			type: String,
			enum: ProductSpecies,
			required: true,
		},

		productGender: {
			type: String,
			enum: ProductGender,
		},

		productTitle: {
			type: String,
			required: true,
		},

		productPrice: {
			type: Number,
			required: true,
		},

		productViews: {
			type: Number,
			default: 0,
		},

		productLikes: {
			type: Number,
			default: 0,
		},

		productComments: {
			type: Number,
			default: 0,
		},

		productRank: {
			type: Number,
			default: 0,
		},

		productImages: {
			type: [String], // Bitta productning bir nechta rasmi bo'ladi, shuning uchun array. Har bir rasm URL manzili bo'ladi:
			required: true,
		},

		productDesc: {
			type: String,
		},

		memberId: { // productlarni kim yaratganini belgilaydi
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member', // osha malumotlarni Member datadan olasan
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'products' },
);

ProductSchema.index({ productType: 1, productSpecies: 1, productTitle: 1, productPrice: 1 }, { unique: true }); // COMPOUND INDEX: Agar databaseda allaqachon shu 4 tasi bir xil product bo'lsa, MongoDB ikkinchisini saqlamaydi, xato beradi.

export default ProductSchema;
