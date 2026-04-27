class HttpError extends Error {
    httpCode: number;
    constructor (msg: string, httpCode: number) {
        super(msg);
        this.httpCode = httpCode;
    }
}

export default HttpError;