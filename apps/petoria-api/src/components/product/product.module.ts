import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from '../../schemas/Product.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			// DBni alohida ulab oldik va Database Connection mantig'i bn Schemani bog'ladik
			{
				name: 'Product', // shu nom ostida yoziladi
				schema: ProductSchema, // shu nom bn export qilingan schema Model
			},
		]),
		AuthModule, // both => member moduleni qurishda yordam beradigan boshqa modulelarni chaqirib oldik
		ViewModule, //
		MemberModule,
		LikeModule,
	],
	providers: [ProductService, ProductResolver], // MemberModulega xizmat qiluvchi asosiy mantiqlar
	exports: [ProductService],
})
export class ProductModule {}
