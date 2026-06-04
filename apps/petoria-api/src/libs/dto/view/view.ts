import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';

@ObjectType() // Backenddan Frontendga chiqib ketayotgan DTO
export class View {
	@Field(() => String)
	_id: ObjectId; // Backendda Databasega aynan ObjectId korinishida yoziladi

	@Field(() => ViewGroup) // Member, Article, Property
	viewGroup: ViewGroup;

	@Field(() => String)
	viewRefId: ObjectId; // ViewGroupdagi qaysi biri korilsa, o'shani idsi yoziladi

	@Field(() => Int)
	memberId: ObjectId; // qaysi user korgan bolsa, oshani idsi yoziladi

	@Field(() => Date)
	createdAt: Date; // qachon korilgan 

	@Field(() => Date)
	updatedAt: Date;
}
