import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";
import {Expose} from "class-transformer";

export class LoginDto {
    @ApiProperty({
        description: 'You can use a valid email or nick name',
        example: 'foo@bar.com',
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    nick_name: string;

    @ApiProperty({
        description: 'Your account password',
        example: '123456',
        required: true,
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    password: string;

}