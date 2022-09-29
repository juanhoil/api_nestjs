import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { AppService } from './app.service';
import { OriginApp } from './common/decorator/Origin-app.decorator';
import { Public } from './common/decorator/public.decorator';
import { MailService } from './core/mailer/mail.service';
import { AuthService } from './modules/auth/auth.service';
import { LocalAuthGuard } from './modules/auth/guards/local-auth.guard';
import { CreateUserCustomerDto } from './modules/user/dto/CreateUserCustomer.dto';
import { LoginDto } from './modules/user/dto/LoginDto';
import { UserService } from './modules/user/user.service';
import { compareSync, genSalt, hash } from 'bcrypt';
import * as moment from 'moment';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('auth/login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const user = await this.authService.login(req.user);
    if (!user.account_activated) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Not authenticated',
          message: 'This account is not activated',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  @Public()
  @Post('auth/customer/register')
  async registerCustomer(@Body() userDto: CreateUserCustomerDto) {
    if (!userDto.email) throw new BadRequestException('email is required');

    const user = await this.userService.createCustomer(userDto);

    /*let customer = await this.userService.model.findOne({ _id: user.id });
    await sendinble.sendinbleService.saveContact({ 
      EMAIL: customer.email,
      NICKNAME:customer.nick_name,
      VERIFIED_EMAIL: false,
      BIRTHDAY: customer.customer.born_date
    })*/

    const token = await this.authService.signToken(
      { id: user.id, nick_name: user.nick_name },
      '20m',
    );

    const tokenCode = await this.authService.signToken(
      { id: user.id, nick_name: user.nick_name },
      '10m',
    );

    try {
      await this.mailService.sendUserConfirmationDT(user, tokenCode);
    } catch (e) {
      console.log(e);
    }

    return { ...user, token, tokenCode, verificationCode: 0 };
  }

  @Post('auth/customer/check')
  async checkToke(@Body() body: { token: string }) {
    try {
      const { token } = body;
      let result = await this.authService.verifyToken(token);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
      };
    }
  }

  @Public()
  @Post('auth/send-verification-code/:id')
  async sendVerificationCode(@Param('id') id: string) {
    const user = await this.userService.getOneById(id);
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const tokenCode = await this.authService.signToken(
      { id: user._id, nick_name: user.nick_name },
      '10m',
    );
    await this.mailService.sendUserConfirmationDT(user, tokenCode);
    return { code: verificationCode };
  }

  @Public()
  @Get('auth/test-email/:email')
  async sendTestEmail(@Param('email') email: string) {
    await this.mailService.sendUserWelcomeTest(email);
    return { message: 'oK' };
  }

  @Public()
  @Post('auth/grecaptcha-verify')
  async sendVerificationTokenRecaptcha(@Body('response') data) {
    const secretKey =
      process.env.NODE_ENV === 'production'
        ? process.env.RECAPTCHA_SECRET_KEY_PROD
        : process.env.RECAPTCHA_SECRET_KEY_DEV;
    const payload = {
      secret: secretKey,
      response: data,
    };
    const responseGoogle = await this.appService.sendVerificationRecaptcha(
      payload,
    );
    if (!responseGoogle) {
      throw new NotFoundException('Google api not working');
    }
    const response = await firstValueFrom(responseGoogle);
    return response.data;
  }

  @Public()
  @Post('auth/forgot-password')
  async sendForgotPassword(
    @Body('email') email: string,
    @Res() res,
    @OriginApp() app: { isDirty: boolean; isTalkb: boolean },
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    let user = await this.userService.model.findOne({ email: email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.authService.signToken(
      { id: user.id, nick_name: user.nick_name },
      '15m',
    );

    const link = app.isDirty
      ? `${process.env.URL_DIRTYTALKS}forgot-password?token=${token}`
      : `${process.env.URL_TALKB}forgot-password?token=${token}`;

    let data = {
      email: email,
      date: moment().format('YYYY-MM-DD HH:mm'),
      link,
    };

    let info = await this.mailService.sendRestorePassword(data);
    return res.status(201).json({ message: `send email successfully `, user });
  }

  @Public()
  @Put('auth/restore-password/:id')
  async newPassword(@Req() req, @Res() res) {
    let { id } = req.params;
    let { newPassword, repeatNewPassword, token } = req.body;
    let tokenValid = false;
    if (!id)
      return res.status(400).json({ message: `id is required for action` });
    if (!token) return res.status(400).json({ message: `token is required` });

    let result = await this.authService.verifyToken(token);
    if (result == undefined)
      return res
        .status(201)
        .json({ message: `the token to expired`, tokenValid });

    if (!newPassword)
      return res.status(400).json({ message: `New password is required` });
    if (!repeatNewPassword)
      return res
        .status(400)
        .json({ message: `The new password is required repeated` });
    if (newPassword != repeatNewPassword)
      return res
        .status(400)
        .json({ message: `Repeated passwords are not the same` });

    let customer = await this.userService.model.findOne({ _id: id });
    let salt = await genSalt(10);
    let credentials = await hash(newPassword, salt);
    if (!customer) return res.status(400).json({ message: `User no found` });
    await this.userService.model.findOneAndUpdate(
      { _id: id },
      { password: credentials },
      { new: true },
    );

    tokenValid = true;
    return res
      .status(201)
      .json({ message: `password was updated successfully`, tokenValid });
  }

  @Public()
  @Put('auth/change-password/:id')
  async changePassword(@Req() req, @Res() res) {
    let { id } = req.params;
    let { oldPassword, newPassword, repeatNewPassword } = req.body;
    let tokenValid = false;
    if (!id)
      return res.status(400).json({ message: `id is required for action` });
    if (!oldPassword)
      return res.status(400).json({ message: `oldPassword is required` });
    if (!newPassword)
      return res.status(400).json({ message: `New password is required` });
    if (!repeatNewPassword)
      return res
        .status(400)
        .json({ message: `The new password is required repeated` });
    if (newPassword != repeatNewPassword)
      return res
        .status(400)
        .json({ message: `Repeated passwords are not the same` });

    let customer = await this.userService.model.findOne({ _id: id });
    let salt = await genSalt(10);
    let credentials = await hash(newPassword, salt);
    if (!customer) return res.status(400).json({ message: `User no found` });

    const TYPE = 'customer';

    customer = await this.userService.model.findOneAndUpdate(
      { _id: id, type: TYPE },
      { password: credentials },
      { new: true },
    );

    tokenValid = true;
    return res
      .status(201)
      .json({ message: `password was updated successfully`, customer });
  }

  @Public()
  @Put('auth/change-email/:id')
  async changeEmail(@Req() req, @Res() res) {
    let { id } = req.params;
    let { password, email } = req.body;
    let tokenValid = false;
    if (!id)
      return res.status(400).json({ message: `id is required for action` });
    if (!password)
      return res.status(400).json({ message: `oldPassword is required` });
    if (!email)
      return res.status(400).json({ message: `New password is required` });

    let customer = await this.userService.model.findOne({ _id: id });

    const isMatch = compareSync(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!customer) return res.status(400).json({ message: `User no found` });

    //await sendinble.sendinbleService.updateContact(customer.email,{EMAIL: email, VERIFIED_EMAIL: false})
    const TYPE = 'customer';

    customer = await this.userService.model.findOneAndUpdate(
      { _id: id, type: TYPE },
      { email: email, email_checked: false },
      { new: true },
    );

    tokenValid = true;
    return res
      .status(201)
      .json({ message: `email was updated successfully`, customer });
  }

  @Public()
  @Post('auth/refresh-token')
  async refresToken(@Req() req, @Res() res, @Body('token') token: string) {
    try {
      const jwt = await this.authService.refreshToken(token);
      if (jwt) {
        res.status(201).json({
          ...jwt,
        });
      } else {
        throw new UnauthorizedException('Not Found Token');
      }
    } catch (e) {
      throw new UnauthorizedException('Not Found Token');
    }
  }

  @Public()
  @Get('auth/email-exist')
  async checkIfEmailExist(@Query('email') email: string) {
    const exist = await this.userService.checkIfExistByEmail(email);
    return {
      data: exist,
    };
  }

  @Public()
  @Get('auth/username-exist')
  async checkIfUsernameExist(@Query('username') username: string) {
    const exist = await this.userService.checkIfExistByUsername(username);
    return {
      data: exist,
    };
  }
}
