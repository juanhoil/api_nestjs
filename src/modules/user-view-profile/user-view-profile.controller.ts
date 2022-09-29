import {Body, Controller, Post} from '@nestjs/common';
import {Crud} from "nestjs-mongoose-crud";
import {UserViewProfile, UserViewProfileDocument} from "./schema/user-view-profile.schema";
import {UserViewProfileService} from "./user-view-profile.service";
import {CrudPlaceholderDto} from "nestjs-mongoose-crud/dist/crud.controller";
import {ApiOperation} from "@nestjs/swagger";
import {get} from "lodash";
import { ChatService } from '../chat/chat.service';
import {ModelType} from "@typegoose/typegoose/lib/types";


/*@Crud({
    model: UserViewProfile
})*/
@Controller('queue-trigger/user-view-profile')
export class UserViewProfileController {
    crudOptions = {}
    model: ModelType<UserViewProfileDocument>

    constructor(
        public service: UserViewProfileService,
        public chatServide: ChatService
    ){
        this.model = service.model
    }

    @Post()
    @ApiOperation({summary: "Create a record"})
    async create(@Body() body: CrudPlaceholderDto) {
        const transform = get(this.crudOptions, "routes.create.transform");
        if (transform) {
            body = transform(body);
        }
        const respose = body as UserViewProfile
        const {
            find,
            status
        } = await this.service.findByCusAndVirt(respose.customer, respose.virtual)

        if (status === 'find' && status) {
            // encontrado y no se hace nada
            return {
                message: 'event exist finde',
                create: false
            }
        }
        // const existChat = await this.chatServide.findChatByCusAndVirt(respose.customer as undefined as string, respose.virtual as undefined as string)
        // !existChat && console.log('chat', existChat)
        console.log(status, 'status')
        if (status === 'undefined') {
            await this.model.create(body);
            const {customer, virtual} = respose
            await this.chatServide.createNewChat(customer, virtual, true)
            return {
                message: 'event created undefined',
                create: true,
            }
        } else {
            return {
                message: 'event exist',
                create: false,
            }
        }
    }

}
