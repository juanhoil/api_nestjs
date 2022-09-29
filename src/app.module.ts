import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HttpModule } from '@nestjs/axios'
import { VirtualModule } from './modules/virtual/virtual.module';
import { MyQueueModule } from './modules/my-queue/my-queue.module';
import { ChatModule } from './modules/chat/chat.module';
import { UniqueActionModule } from './modules/uniqueaction/uniqueaction.module';
import { CityModule } from './modules/city/city.module';
import { CountryModule } from './modules/country/country.module';
import { PreferenceModule } from './modules/preference/preference.module';
import { PackCoinsModule } from './modules/coinsPack/packCoins.module';
import { PaymentHistoryModule } from './modules/paymentHistory/paymentHistory.module';
import { PicturesVerificationModule } from './modules/picturesVerification/picturesVerification.module';
import { MessageModule } from './modules/message/message.module';
import { UserViewProfileModule } from './modules/user-view-profile/user-view-profile.module';

@Module({
  imports: [
    CoreModule,
    HttpModule,
    UserModule,
    AuthModule,

    VirtualModule,
    UniqueActionModule,
    MyQueueModule,
    ChatModule,
    MessageModule,
    CityModule,
    CountryModule,
    PreferenceModule,
    PackCoinsModule,
    PaymentHistoryModule,
    PicturesVerificationModule,
    UserViewProfileModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
