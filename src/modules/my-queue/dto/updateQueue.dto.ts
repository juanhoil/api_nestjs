import {IsNotEmpty, IsOptional, Max, IsString, IsDate, MaxLength, MinLength, IsEmail, IsNumber} from "class-validator";

export class MyQueueDto {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    chat: string;

    @IsOptional()
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    verification: string;

    @IsOptional()
    @IsString()
    date: string;

    @IsString()
    @IsOptional()
    status: string;

}