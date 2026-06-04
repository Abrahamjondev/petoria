import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles); // metadatani roles nomi bn qoshdik, stringlarni(USER, AGENT) qabul qilib roles nomi ichiga yuklaydi
// @UseGuard(RolesGuard) un ishlatiladi, yani roles ichini boyitib beradi