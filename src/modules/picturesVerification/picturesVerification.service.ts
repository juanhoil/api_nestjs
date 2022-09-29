import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { PictureVerification, PictureVerificationDocument } from './schema/picturesVerification.schema';
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class PicturesVerificationService {

    public constructor(
        @InjectModel(PictureVerification.name) public model: ModelType<PictureVerificationDocument, PictureVerificationDocument>,
    ) {}
}