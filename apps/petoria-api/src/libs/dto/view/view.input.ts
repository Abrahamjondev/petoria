import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import * as mongoose from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';

@InputType() 
export class ViewInput { // View yozilishi uchun kk 
	@IsNotEmpty() // bo'sh bo'lmasin/kiritilishi kk
	@Field(() => String) // GraphQLga tegishli
	memberId: mongoose.ObjectId; // Schemaga tegishli

	@IsNotEmpty()
	@Field(() => String)
	viewRefId: mongoose.ObjectId; // 

	@IsNotEmpty()
	@Field(() => ViewGroup)
	viewGroup: ViewGroup;
}

