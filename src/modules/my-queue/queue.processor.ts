import { Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueDelay, QueueTrigger } from 'src/interfaces/triggers.type';
import { ChatService } from '../chat/chat.service';
import { MessageService } from '../message/message.service';
import { Messages } from '../message/schema/message.schema';
import { IniqueActionEnum } from '../uniqueaction/schema/uniqueaction.schema';
import { Virtual } from '../virtual/schema/virtual.schema';
import { MyQueueService } from './my-queue.service';
import { MyQueue, MyQueueStatus } from './schema/my-queue.schema';


interface BirthDay {
    chatId: any;
    virtualId: any;
    customerId: any
}

interface UniqueActionUser {
    virtualId: any;
    customerId: any;
    type: IniqueActionEnum
}

interface FireMe {
    virtual: Virtual;
    customer: string
}


@Processor('trigger')
export class QueueProcessor {
    private readonly logger = new Logger(QueueProcessor.name);

    constructor(
        @Inject(forwardRef(() => MyQueueService))
        private readonly queueService: MyQueueService,
        @Inject(forwardRef(() => MessageService))
        public messageService: MessageService) {
    }

    @Process('queue_generic_dirty')
    async queueGeneric(job: Job<QueueTrigger<any>>) {
        const { type, payload } = job.data
        this.logger.debug(`Trigger ${type}`);
        this.logger.debug(`Trigger ${JSON.stringify(payload)}`);
        if(job.data.details){
            this.logger.debug(`Trigger Details ${JSON.stringify(job.data.details.humanTime)}`);
        }
        
        await this.queueService.processTrigger(type, payload)
    }
}