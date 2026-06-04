import { Logger } from '@nestjs/common'; // console.log o‘rniga professional log qilish uchun
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws'; // websocket server type
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service'; // aynan WebSocket TCP connection un token verify qilish un
import { Member } from '../libs/dto/member/member';
import * as url from 'url'; // websocket connection url ichidan query olish un, queryga token bergandik va osha tokenni qabul qilib serverga so'rov qilgan userni topamiz

interface MessagePayload { // websocket orqali user yuboradigan oddiy chat message structure.
	event: string; // qanday event ekanini bildiradi: 'message'
	text: string; // user yuborgan message texti
	memberData: Member; 	// message yuborgan user ma'lumotlari
}

interface InfoPayload { // system yuboradigan info message structure: "Ali joined"; "Vali left"; "online userlar soni 5 ta"
	event: string; // event nomi: 'info'
	totalClients: number; // hozir websocket connection bn nechta client ulanganini saqlaydi
	memberData: Member; // qaysi user connect/disconnect qilganini yuboradi
	action: string; 	// qanday action bo‘lgan: joined; left
}

// Bu decorator NestJSga: “Mana bu class websocket server bo‘ladi”. Agar bu bo‘lmasa: NestJS bu classni websocket server deb tan olmaydi; websocket eventlari ishlamaydi, connection bo‘lmaydi
@WebSocketGateway({ transports: ['websocket'], secure: false }) // bu class websocket gateway; faqat websocket transport ishlaydi; ws:// ishlatiladi, wss:// emas
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway'); // logger ichida => vaqt; context; log level; filtering
	private summaryClient: number = 0; // hozir nechta user websocketga ulangan
	private clientsAuthMap = new Map<WebSocket, Member>(); // qaysi websocket clientga qaysi user tegishli: client1 -> Ali; client2 -> Vali
	private messagesList: MessagePayload[] = []; // oxirgi messagelarni vaqtincha RAMda saqlaydi, connection qilgan userlarga so'nggi 5ta xabarni saqlab, ularga tezda korsatish un 

	constructor(private authService: AuthService) {} // dependency injection: AuthServiceni shu class ichida ishlatish uchun olib keldik

	@WebSocketServer() // websocket server objectini nestjs inject qiladi va
	server: Server; // this.server.clients orqali barcha clientlarga access qilish mumkin
 // Bu bo‘lmasa: barcha connected userlarni bilishni, broadcast qilolishni, websocket serverga access olishni imkoni yoq
	public afterInit(server: Server) { // websocket server initialize bo‘lgandan keyin 1 marta ishlaydi, ya'ni Server start bo‘ldi: websocket tayyor
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`); // server ishga tushgani haqida log
	}

	private async retrieveAuth(req: any): Promise<Member> { // user websocket connect bo‘layotganda tokenni olib userni aniqlaydi
		try {
			const parseUrl = url.parse(req.url, true); // websocket urlni BDga qabul qiladi: ws://localhost:3000?token=abc123
			const { token } = parseUrl.query; // url query ichidan tokenni olib
			return await this.authService.verifyToken(token as string); // verify qiladi va token to‘g‘ri bo‘lsa user object qaytadi
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) { // yangi websocket user connect bo‘lganda ishlaydi
		const authMember = await this.retrieveAuth(req); // token orqali userni aniqlaydi
		this.summaryClient++; // online user sonini oshiradi
		this.clientsAuthMap.set(client, authMember); // shu websocket client kimga tegishli ekanini saqlab qo‘yyapmiz, from now on client1 -> Ali

		const clientNick: string = authMember?.memberNick ?? 'Guest'; // agar user login qilgan bo‘lsa nickname oladi bo‘lmasa 'Guest'
		this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`); // yangi connection logi

		const infoMsg: InfoPayload = {
			event: 'info', // bu user yuborayotgan oddiy chat message emas
			totalClients: this.summaryClient, // online userlar soni
			memberData: authMember, // qaysi user connect qilgani
			action: 'joined', // user systemga qo‘shildi, 'left' boladi chiqib ketsa
		};
		this.emitMessage(infoMsg); 	// barcha clientlarga "Ali joined" degan info yuboriladi
		client.send(JSON.stringify({ event: 'getMessages', list: this.messagesList })); // yangi connect bo‘lgan clientga so'nggi 5ta message yuboriladi
	} // websocket directly object yuborolmasligi un stringga aylantirdik

	public handleDisconnect(client: WebSocket) { // user websocketdan chiqib ketsa
		const authMember = this.clientsAuthMap.get(client); // qaysi user chiqib ketganini oladi
		this.summaryClient--; // online userlar sonini kamaytiradi
		this.clientsAuthMap.delete(client); // map ichidan clientni o‘chiradi

		const clientNick: string = authMember?.memberNick ?? 'Guest'; // login bo'lgan bo'lsa: "Ali" left, login bolmagan user bolsa: "Guest" left
		this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`); // disconnect log

		const infoMsg: InfoPayload = {
			event: 'info', // bu system info message, user chatda yuborgan bir message emas
			totalClients: this.summaryClient, // yangi online count
			memberData: authMember, // qaysi user chiqib ketgani
			action: 'left', // qanday action sodir boldi
		};
		this.broadcastMessage(client, infoMsg); // chiqib ketgan userdan tashqari hammaga yuboriladi
	}

	@SubscribeMessage('message') // client "message"[chatda xabar] event yuborganda shu method ishlaydi
	public async handleMessage(client: WebSocket, payload: string): Promise<void> { // payload -> user yuborgan text
		const authMember = this.clientsAuthMap.get(client); // qaysi user message yuborganini oladi
		const newMessage: MessagePayload = { event: 'message', text: payload, memberData: authMember }; // bu oddiy chat message; user yuborgan text; qaysi user yuborgani

		const clientNick: string = authMember?.memberNick ?? 'Guest'; // login bo'lgan user bo'lsa nicki, login bo'lmagan bo'lsa 'Guest' nicki ostida
		this.logger.verbose(`NEW MESSAGE [${clientNick}]: ${payload}`); // message logi: "I am very satisfied with service"

		this.messagesList.push(newMessage); // yangi message ni listga qo‘shadi
		if (this.messagesList.length > 5) this.messagesList.splice(0, this.messagesList.length - 5); // agar message 5 tadan oshib ketsa eski messagelarni o‘chiradi va faqat oxirgi 5 ta message qoladi

		this.emitMessage(newMessage); // message barcha clientlarga yuboriladi
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) { // senderdan tashqari barcha clientlarga yuboradi
		this.server.clients.forEach((client) => { // serverdagi barcha websocket clientlarga message yuborish un qabul qilib
			if (client !== sender && client.readyState === WebSocket.OPEN) { // message yuborgan userning o‘ziga yuborma va faqat connection active bo‘lgan clientlarga yubor [websocket statelar: CONNECTING; OPEN; CLOSING; CLOSED]
				client.send(JSON.stringify(message)); // message objectini json stringga aylantirib yuboradi
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) { // barcha clientlarga yuboradi; sender ham oladi
		this.server.clients.forEach((client) => { // serverdagi barcha websocket clientlarni qabul qilib
			if (client.readyState === WebSocket.OPEN) { // faqat connection active clientlarga
				client.send(JSON.stringify(message)); // message ni json string qilib clientga yuboradi
			}
		});
	}
}

/*
broadcastMessage => barcha clientlarga yuboriladi, lekin sender olmaydi: Ali chiqib ketsa, "Ali left" degan xabarni o'zi ko'rishi shart emas
emitMessage	=> barcha clientlarga yuboriladi va sender ham oladi: Ali "Hello" deb yozsa, o'zi ham korishi kk
interface MessagePayload {
	// BDga data kirishi va FDga data ketishi uchun
	event: string;
	text: string;
}

interface InfoPayload {
	// user WebSocket bog'lanish qilganida boshqa shu bog'lanishda turgan userlarga inform qilish un
	event: string;
	totalClients: number;
}

	@WebSocketServer() // WebSocket decorator orqali WebSocket Serverimizni qabul qildik [nestjsni websocketidan qabul qildik]
	public server: Server;

		const infoMsg: InfoPayload = {
			event: 'info', 
			totalClients: this.summaryClient, // yuqoridagi this.summaryClient++ dan keladi
		};


	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) { // clientni readyState = OPEN bolganlarigagina xabar yuboriladi
				client.send(JSON.stringify(message)); // yuboriladigan xabarni json formatga o'girish zarur
			}
		});
	}
  */
