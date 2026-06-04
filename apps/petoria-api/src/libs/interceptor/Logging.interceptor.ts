import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { stringify } from 'querystring';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger(); // logger[state property] => req/res data process malumotlarini terminalga chiqarish un

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> { // [Promise kabi] Observable => Functional Reactive Programming unsuri
		const recordTime = Date.now();
		// REST api = HTTP req.; GraphQL server = GraphQL request
		const requestType = context.getType<GqlContextType>(); // aynan qaysi turdagi req. type kirayotganligini aniqlash un

		if (requestType === 'http') { // Logging interceptor mantig'ini kirib kelayotgan req. turiga qarab shakllantirdik
			/* Develop if needed! hozircha LoggingInterceptor GraphQL serveri un */
			return next.handle();
		} else if (requestType === 'graphql') {
			/* [1] Print Incoming Request */
			const gqlContext = GqlExecutionContext.create(context); // kirib kelayotgan req. contexti
			this.logger.verbose(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST'); // gql Contextda datalar kelayotgandi, ularni ichidan aynan bodysini oldik [req. body => clientdan yuborilayotgan query sintaksis, FDdan kelayotgan user jonatgan data]

			/* [2] Error Handling via GraphQL */

			/* [3] No Errors, giving Response below */
			return next.handle().pipe(
				tap((context) => { // res.ning ham contexti bor va uni qabul qildik
					const responseTime = Date.now() - recordTime; // res. berayotgan vaqt - req. ilk kirib kelgan vaqt
					this.logger.warn(`${this.stringify(context)} - ${responseTime}ms \n\n`, 'RESPONSE'); // context -> BD yuborayotgan res. matnini stringify orqali [JSON] ga otkazib qabul qildik
				}),
			);
		}
	} // CONTEXT - OBJECT TYPE
	private stringify(context: ExecutionContext): string {
		return JSON.stringify(context).slice(0, 75); // kirib kelayotgan contextni string (JSON format)ga otkazadi va contextdagi req.bodyni [75] indexgacha qismini oladi
	}
}
