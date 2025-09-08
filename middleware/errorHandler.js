const ExpressError = require("../utils/expressError")

// 404 Handle middleware
function notFound(req, res, next) {
    const e = new ExpressError("Page Not Found", 404)
    next(e)
}

//General error handler middleware
function errorHandler(e, req, res, next) {
    //Default status 500 Internal Server Error
    let status = e.status || 500;
    let message = e.message;

    //Set the status and alert the user
    return res.status(status).json({
        e:{ message, status}
    });
}

module.exports = {notFound, errorHandler};