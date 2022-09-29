import { QueenRedisE, QueueRedis } from "src/common/interfaces/redis.type";
import { MyQueueStatus, MyQueueType, QueueStatus, QueueType } from "src/modules/my-queue/schema/my-queue.schema";


export interface TimeTrigger {
    hourNow: string;
    timeNow: number
    ramdomHour: string;
    ramdomTime: number;
    delay: number
    exeTime: number
    humanTime: string;
}

export interface QueueTrigger<T> {
    payload: T;
    type: QueueRedis | QueenRedisE;
    details?: TimeTrigger;
}


export interface QueueDelay<T> {
    payload: T;
    type: "message" | "chat"
    details: TimeTrigger;
}

export interface QueueNEW<T>{
    chat: string
    date:  string
    status: MyQueueStatus | QueueStatus
    type: MyQueueType | QueueType
}