/** 
 * Wraps async route handlers to catch errors automatically
 *  @param {function} fn - The async controller function
 */

const asyncHandler = (fn) => {
    return (req, res, next) => {
        //Execute the function. If it throws or rejects, catch it and pass to next()
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};

module.exports = asyncHandler;