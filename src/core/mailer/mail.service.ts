import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { RoleEnum, TypeEnum, User } from "../../modules/user/schema/user.schema";
import * as moment from 'moment'
import { PictureUser } from "../../modules/user/schema/picture.user.schema";

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {
    }

    async sendUserConfirmationDT(user: Partial<User>, token: string) {
        const url = `https://dirtytalks.club/app/verify-email/${token}`;
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Welcome to Dirty Talks! Confirm your Email',
            template: 'confirmation-dirty-talks',
            context: {
                name: user.nick_name,
                url
            },
        });
    }

    async sendUserWelcome(user: Partial<User>) {
        await this.mailerService.sendMail({
            to: user.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Dirty Talks!',
            template: 'welcome-dirty-talks', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: user.nick_name,
            },
        })
    }

    async sendUserWelcomeTest(email: any) {
        await this.mailerService.sendMail({
            to: email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Dirty Talks!',
            template: 'welcome-dirty-talks', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: 'test',
            },
        })
    }

    async sendUserConfirmationTB(user: {
        id: string,
        role: RoleEnum,
        type: TypeEnum,
        account_activated: boolean,
        email_checked: boolean,
        picture?: PictureUser,
        nick_name: string,
        email: string,
    }, urlPage: string, token: string) {
        const url = `${urlPage}email-confirmation?token=${token}`;
        await this.mailerService.sendMail({
            to: user.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: `${user.nick_name} - ${user.role}  Confirm your email`,
            template: 'confirmation-talk-b', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: user.nick_name,
                url,
            },
        });
    }

    async sendRestorePassword(data) {
        await this.mailerService.sendMail({
            to: data.email, // list of receivers
            subject: "Forgot password", // Subject line,
            template: 'restore-password-dirty-talks',
            context: {
                email: data.email,
                date: data.date,
                link: data.link
            },
        });
    }

    async sendMessageStats(user: User, urlPage: string, token: string) {
        const url = `${urlPage}?token=${token}`;
        await this.mailerService.sendMail({
            to: user.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Nice App! Confirm your Email',
            template: 'messages-stats', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: user.nick_name,
                url,
            },
        });
    }

    async sendCoinsPurchased(user: User, urlPage: string, token: string) {
        const url = `${urlPage}?token=${token}`;
        await this.mailerService.sendMail({
            to: user.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Nice App! Confirm your Email',
            template: 'confirmation-coins-purchased', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: user.nick_name,
                url,
            },
        });
    }

    async sendREportVirtual(payload: { name: string, email: string, comment: string, idVirtual: string }) {
        await this.mailerService.sendMail({
            to: 'contact.madtech@gmail.com',
            // from: '"Support Team" <support@example.com>', // override default from
            subject: `report profile virtual`,
            template: 'report-profile-virtual', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: payload.name,
                email: payload.email,
                comment: payload.comment,
                idVirtual: payload.idVirtual,
                urlProfileVirtual: `https://dirtytalks.club/app/gallery-profiles/${payload.idVirtual}`
            },
        });
    }

    async sendContactUser(payload: { name: string, email: string, comment: string, idCustomer: string, subject: string }) {
        await this.mailerService.sendMail({
            to: 'contact.madtech@gmail.com',
            // from: '"Support Team" <support@example.com>', // override default from
            subject: payload.subject,
            template: 'contact', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: payload.name,
                email: payload.email,
                comment: payload.comment,
                idCustomer: payload.idCustomer
            },
        });
    }

    async sendREport(payload: { name: string, email: string, comment: string, idCustomer: string, url: string }) {
        await this.mailerService.sendMail({
            to: 'contact.madtech@gmail.com',
            // from: '"Support Team" <support@example.com>', // override default from
            subject: `report profile virtual`,
            template: 'report', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: payload.name,
                email: payload.email,
                comment: payload.comment,
                idVirtual: payload.idCustomer,
                url: payload.url
            },
        });
    }

    async sendAddOrSubstrac(user: Partial<User>, newCoins: number, detail: string,isSum: boolean) {
        let action = isSum? 'added': 'subtracted'
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Dirty Talks',
            template: 'add-coins',
            context: {
                action: action,
                name: user.nick_name,
                newCoins: newCoins,
                detail: detail
            },
        });
    }

}