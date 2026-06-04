import { registerEnumType } from "@nestjs/graphql";
import { Dir } from "fs";

export enum Message {
	SOMETHING_WENT_WRONG = 'Something went wrong!',
	NO_DATA_FOUND = 'No data found!',
	CREATE_FAILED = 'Creation failed!',
	UPDATE_FAILED = 'Update failed!',
	REMOVE_FAILED = 'Removal failed!',
	UPLOAD_FAILED = 'Upload failed!',
	BAD_REQUEST = 'Bad request!',

	USED_MEMBER_NICK_OR_PHONE = "Already used member nick or phone",
	NO_MEMBER_NICK = 'No member found with that nickname!',
	BLOCKED_USER = 'Your account has been blocked!',
	WRONG_PASSWORD = 'Incorrect password, please try again!',
	NOT_AUTHENTICATED = 'You are not authenticated. Please log in first!',
	TOKEN_NOT_EXIST = 'Authorization token is missing!',
	ONLY_SPECIFIC_ROLES_ALLOWED = 'Access is restricted to specific roles!',
	NOT_ALLOWED_REQUEST = 'Request is not allowed!',
	PROVIDE_ALLOWED_FORMAT = 'Only JPG, JPEG, or PNG formats are allowed!',
	SELF_SUBSCRIPTION_DENIED = 'You cannot subscribe to yourself!',
}

export enum Direction {
	ASC = 1,
	DESC = -1,
}
registerEnumType(Direction, {
	name: 'Direction',
});