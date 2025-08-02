export class RegistrationReqDto {
    id: string;
    password: string;
}

export class RegistrationResDto {
    
}

export class LoginReqDto {
    id: string;
    password: string;
}

export class LoginResDto {
    sessionId: string;
    seq: number;
    id: string;
}

export class WalletLinkReqDto {
    privateKey: string;
}
