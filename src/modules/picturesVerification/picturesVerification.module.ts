import { Module } from '@nestjs/common';
import { PicturesVerificationController } from './picturesVerification.controller';
import { PicturesVerificationService } from './picturesVerification.service';
import { MongooseModule } from "@nestjs/mongoose";
import { PictureVerification, PictureVerificationSchema } from './schema/picturesVerification.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PictureVerification.name, schema: PictureVerificationSchema }]),
    ],
    controllers: [PicturesVerificationController],
    providers: [
        PicturesVerificationService
    ],
    exports: []
})
export class PicturesVerificationModule {}