class ApiError {
    constructor(err) {
        if (err instanceof Error) return err;
        // this.name = 'ApiError';
        if (Object.prototype.toString.call(err) === '[object Object]') {
            Object.assign(this, err);
        } else {
            this.message = err;
        }
    }
}
global.ApiError=ApiError;