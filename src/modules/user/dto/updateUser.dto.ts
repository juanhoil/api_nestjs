import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, ValidateNested } from "class-validator";

export class PictureProfileVerificationDto {
    @IsString()
    @MaxLength(400)
    fileId: string;

    @IsString()
    @MaxLength(400)
    name: string;

    @IsString()
    @MaxLength(400)
    filePath: string;

    @IsString()
    @MaxLength(400)
    url: string;

    @IsString()
    @MaxLength(400)
    imgCompareurl: string;

    @IsString()
    @MaxLength(400)
    thumbnailUrl: string;

}

export class VerifiedCustomerDto {

    @IsNotEmpty()
    @IsString()    
    _id: string;

    @IsBoolean()
    verified: boolean;

    @IsBoolean()
    verifiedAbout: boolean;

    @IsBoolean()
    verifiedImg: boolean;
   
    @IsBoolean()
    verifiedImgGallery: boolean

    @IsOptional()
    @IsDateString()
    vAboutAt: string;

    @IsOptional()
    @IsDateString()
    verified_at: Date;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    type: string

    @IsString()
    @MaxLength(20)
    statusProfile: string

    @IsString()
    @MaxLength(20)
    statusAbout: string

    @IsString()
    @MaxLength(20)
    statusImage: string

    @IsString()
    @MaxLength(20)
    statusVerificationProfile: string

    @IsOptional()
    @IsString()
    @MaxLength(40)
    by: string
}

export class CustomerDto {

    @IsNotEmpty()
    @IsString()
    _id: string
        
    @IsOptional()
    @IsString()
    @MaxLength(15)
    first_name: string;
    
    @IsOptional()
    @IsString()
    @MaxLength(15)
    last_name: string
    
    @IsOptional()
    born_date: string
    
    @IsOptional()
    @IsString()
    @MaxLength(20)
    country: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    region: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    city: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    province: string

    @IsOptional()
    @IsNumber()
    @Max(120)
    age: number

    @IsOptional()
    @IsString()
    @MaxLength(400)    
    about_me: string

    @IsOptional()
    @IsString()
    @MaxLength(40)
    looking_for: string

    @IsOptional()
    @IsString()
    @MaxLength(40)
    orientation: string

    @IsOptional()
    @IsString()
    @MaxLength(40)
    in_search: string

    @IsOptional()
    @IsNumber()
    @Max(250)
    height: number

    @IsOptional()
    @IsNumber()
    tinder_page: number

    @IsOptional()
    @IsNumber()
    @Max(200)
    weight: number

    @IsOptional()
    @IsString()
    @MaxLength(20)
    hair_color: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    eye_color: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    body_art: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    ethnicity: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    living: string

    @IsOptional()
    @IsString()
    @MaxLength(10)
    drinking_habits: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    religion: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    education: string

    @IsOptional()
    @IsNumber()
    @Max(10)
    childrens: number

    @IsOptional()
    @IsString()
    @MaxLength(20)
    smoking_habits: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    zodiac_sign: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    body_style: string

    @IsOptional()
    @IsString()
    @MaxLength(20)
    status: string

    @IsOptional()
    @IsBoolean()
    profile_verified: boolean

    @IsOptional()
    @IsBoolean()
    aboutme_verified: boolean

    @IsOptional()
    @ValidateNested()
    @Type(() => VerifiedCustomerDto)
    verified: VerifiedCustomerDto

    @IsOptional()
    @IsBoolean()
    terms_and_conditions: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    i_am: string;
}


export class addCoinsDto {

    @IsOptional()
    @IsBoolean()
    cAboutme: boolean

    @IsOptional()
    @IsBoolean()
    cEmailVerification: boolean

    @IsOptional()
    @IsBoolean()
    cGallery: boolean

    @IsOptional()
    @IsBoolean()
    cInfo:boolean

    @IsOptional()
    @IsBoolean()
    cInteresting: boolean

    @IsOptional()
    @IsBoolean()
    cLocation: boolean

    @IsOptional()
    @IsBoolean()
    cProfilePicture: boolean

    @IsOptional()
    @IsBoolean()
    cVerificationProfile: boolean

}

export class UserDto {

    @IsOptional()
    @IsArray()
    @Type(() => PictureProfileVerificationDto)
    @ValidateNested({each: true})
    profile_verification:PictureProfileVerificationDto[]

    @Type(() => CustomerDto)
    @ValidateNested()
    customer: CustomerDto

    @Type(() => addCoinsDto)
    @ValidateNested()
    addcoins: addCoinsDto
    
    @IsOptional()
    @IsBoolean()
    openModalWelcome: boolean

    @IsOptional()
    @IsNumber()
    @Max(10)
    modalWelcome: number
    
    @IsOptional()
    @IsBoolean()
    isNewCustomer: boolean

}