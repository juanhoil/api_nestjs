export interface PayloadToken {
    sub: number;
    iat: number;
    exp: number;
}

export interface JwtPayload {
    id: string;
    nick_name: string;
}
