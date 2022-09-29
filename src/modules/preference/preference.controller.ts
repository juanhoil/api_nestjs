import { Controller, Get, Inject, Param } from '@nestjs/common';
import { PreferenceService } from "./preference.service";


@Controller('preference')
export class PreferenceController {
    crudOptions = {}
    model

    constructor(public service: PreferenceService) {
        this.model = service.model
    }

    @Get('all')
    async galleryCount() {
        const prefe = await this.service.alll()
        return { message: "", preferences: prefe }
    }

}
