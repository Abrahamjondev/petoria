import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { MongooseModule } from '@nestjs/mongoose';
import ViewSchema from '../../schemas/View.model';

@Module({ // View name ostida schemani yozib, ViewSchema instancedan foydalanadi
  imports: [MongooseModule.forFeature([{name: 'View', schema: ViewSchema}])], // viewServiceda viewSchemani ishlatish un MongooseModel ichidan forFeature methodi orqali chaqirdik
  providers: [ViewService],
  exports: [ViewService], // boshqa joyda import qilib ishlatish un 
})
export class ViewModule {}
