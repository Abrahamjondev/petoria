import { ObjectId } from "mongoose";

export interface T {
    [key: string]: any;
}

export interface StatisticModifier { // istalgan collectiondagi ixtiyoriy documentationni o'zgartirish imkoni
	_id: ObjectId;
	targetKey: string;
	modifier: number;
}