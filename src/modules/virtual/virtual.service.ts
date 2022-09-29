import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Virtual, VirtualDocument } from './schema/virtual.schema';

@Injectable()
export class VirtualService {

    public constructor(
        @InjectModel(Virtual.name) public model: ModelType<VirtualDocument>,
    ) {
    }


}