const { BaseResponse, BadRequestResponse, UnauthorizedResponse, InternalServerErrorResponse,
        NotFoundResponse, ErrorResponse } = require('../utils/responses'); 


// 1. 404 Handler
function notFound(req, res, next) {
    // Simply pass a NotFoundResponse to the next middleware
    next(new NotFoundResponse(`Page Not Found - ${req.originalUrl}`));
}

// 2. Global Error Handler
function errorHandler(err, req, res, next) {
    
    // --- STEP A: Logging 
    console.error(`[${new Date().toISOString()}] Error:`, {
        name: err.name,
        message: err.message,
        code: err.code, 
        method: req.method,
        url: req.url,
        user: res.locals.user?.id || 'anonymous'
    });

    // --- STEP B: Check if it's already a Custom Response 
    if (err instanceof BaseResponse) {
        return err.send(res);
    }

    // --- STEP C: Convert Library Errors to Custom Responses 
    
    // a. JWT / Auth Errors
    if (err.name === 'JsonWebTokenError') {
        return new UnauthorizedResponse('Invalid token').send(res);
    }
    if (err.name === 'TokenExpiredError') {
        return new UnauthorizedResponse('Token expired').send(res);
    }

    // b. PostgreSQL Errors
    if (err.code === '23505') { // Unique violation
        // 409 Generic ErrorResponse for custom codes
        return new ErrorResponse(409, 'Resource already exists').send(res);
    }
    if (err.code === '23503') { // Foreign key violation
        return new BadRequestResponse('Invalid reference ID').send(res);
    }
    if (err.code === '22P02') { // Invalid input syntax (e.g. UUID format wrong)
        return new BadRequestResponse('Invalid input data format').send(res);
    }
    
    // c. Syntax Errors (e.g. bad JSON body)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return new BadRequestResponse('Invalid JSON format').send(res);
    }

    // --- STEP D: Fallback to 500 
    const serverError = new InternalServerErrorResponse();
    
    if (process.env.NODE_ENV === 'development') {
        serverError.data = { stack: err.stack }; // Attach stack to data field
    }

    return serverError.send(res);
}

module.exports = { notFound, errorHandler };