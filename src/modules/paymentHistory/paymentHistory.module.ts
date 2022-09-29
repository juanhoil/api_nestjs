import { forwardRef, Module } from '@nestjs/common';
import { PaymentHistoryController } from './paymentHistory.controller';
import { PaymentHistoryService } from './paymentHistory.service';
import { PaymentHistory, PaymentHistorySchema } from './schema/paymentHistory.schema';
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from '../user/user.module';
import { PackCoinsModule } from '../coinsPack/packCoins.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PaymentHistory.name, schema: PaymentHistorySchema }]),
        forwardRef(() => UserModule),
        forwardRef(() => PackCoinsModule),
    ],
    controllers: [PaymentHistoryController],
    providers: [ PaymentHistoryService],
    exports: [ PaymentHistoryService]
})
export class PaymentHistoryModule { }