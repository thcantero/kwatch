/** ExpressError extends the normal JS error to easily add a status
 * when making an instance of it.
 * 
 * The error-handling middleware will return this.
*/

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.statuts = status;
        console.error(this.stack);
    }
}

module.exports = ExpressError;