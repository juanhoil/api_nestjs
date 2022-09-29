import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Res
} from '@nestjs/common';
import { ModelType } from "@typegoose/typegoose/lib/types";
import { MyQueueService } from "./my-queue.service";
import { MyQueue, MyQueueDocument, MyQueueType } from './schema/my-queue.schema';
import { MyQueueDto } from './dto/updateQueue.dto';
import { Public } from 'src/common/decorator/public.decorator';
@Controller('my-queue')
export class MyQueueController {

    crudOptions = {}
    model: ModelType<MyQueueDocument, MyQueue>;

    constructor(
        public service: MyQueueService,
    ) {
        this.model = service.model
    }
    
    @Get('count')
    async countQueued(){
        this.service.sendQueueCount()
        return {message: 'ok' }
    }

    @Public()
    @Get('redis')
    async testRedis(){
        this.service.testRediss()
        return {message: 'ok' }
    }

    @Put('get-my-queue')
    async findOrCreate(@Body() payload: MyQueueDto) {
        if (payload.type === MyQueueType.CHAT) {
            let result = await this.service.searchOrUpdate(payload);

            return result;
        }
    }

    @Post()
    async create(@Body() payload: MyQueueDto, @Res() res) {
        if (payload.type === MyQueueType.CHAT) {
            return await this.service.addMyQueueChat(payload,false)
        }
        if(payload.type == MyQueueType.CONTENT || payload.type == MyQueueType.VERIFICATION ){
            return await this.service.searchOrUpdate(payload)
        }
        return res.status(200)
    }
}