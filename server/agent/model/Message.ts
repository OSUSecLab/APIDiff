
export interface MessageBase {
    message: string
}

export interface ResultMessageBase extends MessageBase {
    jobUUID: string;
    jobSequence: number;
}

export interface SuccessResultMessage extends ResultMessageBase {
    result: string;
}

export interface ExceptionResultMessage extends ResultMessageBase {
    exception: string;
}
