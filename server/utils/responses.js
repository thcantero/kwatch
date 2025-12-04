class BaseResponse {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    send(res) {
        return res.status(this.statusCode).json({
            success: this.statusCode >= 200 && this.statusCode < 300,
            message: this.message,
            data: this.data,
            timestamp: this.timestamp,
        });
    }
}

// --- Success Responses ---

class SuccessResponse extends BaseResponse {
    constructor(message = 'Success', data = null) {
        super(200, message, data);
    }
}

class CreatedResponse extends BaseResponse {
    constructor(message = 'Created', data = null) {
        super(201, message, data);
    }
}

// --- Error Responses ---

class ErrorResponse extends BaseResponse {
    constructor(statusCode, message, details = null) {
        // We pass 'details' into the data field of the base class
        super(statusCode, message, details);
    }
}

class BadRequestResponse extends ErrorResponse {
    constructor(message = 'Bad Request', details = null) {
        super(400, message, details);
    }
}

class UnauthorizedResponse extends ErrorResponse {
    constructor(message = 'Unauthorized', details = null) {
        super(401, message, details);
    }
}

class ForbiddenResponse extends ErrorResponse {
    constructor(message = 'Forbidden', details = null) {
        super(403, message, details);
    }
}

class NotFoundResponse extends ErrorResponse {
    constructor(message = 'Not Found', details = null) {
        super(404, message, details);
    }
}

class ValidationErrorResponse extends ErrorResponse {
    constructor(message = 'Validation Error', details = null) {
        super(422, message, details);
    }
}

class InternalServerErrorResponse extends ErrorResponse {
    constructor(message = 'Internal Server Error', details = null) {
        super(500, message, details);
    }
}

module.exports = {
    BaseResponse,
    SuccessResponse,
    CreatedResponse,
    ErrorResponse,
    BadRequestResponse,
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    ValidationErrorResponse,
    InternalServerErrorResponse
};