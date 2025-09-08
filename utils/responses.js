const { extend } = require("dayjs");

class BaseResponse {
    constructor(statusCode, message, data = null){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    send(res) {
        return res.status(this.statusCode).json({
            succes: this.statusCode >=200 && this.statusCode < 300,
            message: this.message,
            data: this.data,
            timestamp: this.timestamp,
        });
    }
}

    //Success responses
    class SuccessResponse extends BaseResponse {
        constructor(message, data = null) {
            super(200, message, data);
        }
    }

    class CreatedResponse extends BaseResponse {
        constructor(message, data=null) {
            super(201, message, data);
        }
    }

    //Error responses
    class ErrorResponse extends BaseResponse {
        constructor(statusCode, message, details =null) {
            super(statusCode, message, details);
        }
    }

    class BadRequestResponse extends BaseResponse {
        constructor(message = 'Bad Request', details = null){
            super(400, message, details);
        }
    }

    class UnauthorizedRequestResponse extends BaseResponse {
        constructor(message = 'Unauthorized', details = null){
            super(401, message, details);
        }
    }

    //403 - Forbidden
    //404 - Not Found
    //422 - Validation Error
    //500 - Internal Server Error

    //Export all responses
    module.exports = {
        BaseResponse,
        SuccessResponse,
        CreatedResponse,
        ErrorResponse,
        BadRequestResponse,
        UnauthorizedRequestResponse
    };


