
import { CoinsUserSchema } from "src/modules/user/schema/coins.user.schema";
import { PictureUser } from "src/modules/user/schema/picture.user.schema";
import { RoleEnum, TypeEnum } from "src/modules/user/schema/user.schema";

export interface LoginResponse {
  id: string;
  email: string;
  nick_name: string;
  role: RoleEnum;
  type: TypeEnum;
  picture: PictureUser;
  email_checked: boolean;
  token: string;
  coins: CoinsUserSchema;
  account_activated: boolean;
}