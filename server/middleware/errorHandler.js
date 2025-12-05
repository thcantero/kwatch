const { 
    BaseResponse, 
    BadRequestResponse, 
    UnauthorizedResponse, 
    InternalServerErrorResponse,
    NotFoundResponse, 
    ErrorResponse 
} = require('../utils/responses'); 


// 1. 404 Handler
function notFound(req, res, next) {
    next(new NotFoundResponse(`Page not found - ${req.originalUrl}`));
}

// 2. Global Error Handler
function errorHandler(err, req, res, next) {
    
    // --- STEP A: Logging 
    // (Only log if it's not a 404/expected error to keep logs clean, or log everything)
    console.error(`[${new Date().toISOString()}] Error:`, {
        name: err.name,
        message: err.message,
        code: err.code, 
        method: req.method,
        url: req.url,
        user: res.locals.user?.id || 'anonymous'
    });

    // --- STEP B: Determine Response Type
    let errorResponse = err;

    if (!(err instanceof BaseResponse)) {
        if (err.name === 'JsonWebTokenError') {
            errorResponse = new UnauthorizedResponse('Invalid token');
        } else if (err.name === 'TokenExpiredError') {
            errorResponse = new UnauthorizedResponse('Token expired');
        } else if (err.code === '23505') { 
            errorResponse = new ErrorResponse(409, 'Resource already exists');
        } else if (err.code === '23503') {
            errorResponse = new BadRequestResponse('Invalid reference ID');
        } else if (err.code === '22P02') {
            errorResponse = new BadRequestResponse('Invalid input data format');
        } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            errorResponse = new BadRequestResponse('Invalid JSON format');
        } else if (err.name === 'ValidationError') {
            // FIX: Handle Validation Errors specifically
            // We use BadRequest (400) because the test expects 400, not 422
            // We pass err.errors as the 'details' (3rd argument)
            errorResponse = new BadRequestResponse('Validation Error', err.errors);
        } else {
            // Generic Fallback
            let status = err.statusCode || err.status || 500;
            let message = err.message || "Internal Server Error";
            
            // FIX: Capture details/errors if they exist on the generic error object
            // This prevents data loss for manual errors thrown with details
            let details = err.errors || err.data || null;

            errorResponse = new ErrorResponse(status, message, details);
            
            if (process.env.NODE_ENV === 'development') {
                // In dev, stack trace overrides data if not already present
                errorResponse.data = errorResponse.data || { stack: err.stack };
            }
        }
    }

    // --- STEP C: Send formatted response matching ALL test expectations
    const statusCode = errorResponse.statusCode || 500;
    
    return res.status(statusCode).json({
        success: false,
        // FIX: Add 'message' at the top level for reviews.test.js
        message: errorResponse.message, 
        // KEEP: 'error' object for errorHandler.test.js
        error: {
            message: errorResponse.message,
            code: statusCode, // Ensure this matches the response status
            // This maps errorResponse.data (the details) to the 'errors' key
            errors: errorResponse.data || [] 
        },
        timestamp: new Date().toISOString()
    });
}

module.exports = { notFound, errorHandler };