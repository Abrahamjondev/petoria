import { Query, Resolver } from '@nestjs/graphql'; // ma'lumot oluvchi method (GET) / GraphQL so'rovlarini qabul qiluvchi class 

@Resolver() // GraphQL so'rovlari resolver orqali otadi (=controller)
export class AppResolver {
	@Query(() => String)
	public sayHello(): string {
		return 'GraphQL API Server';
	}
}
