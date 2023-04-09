const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV == 'development') {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            stack: err.stack,
            error: err
        })
    }

    if (process.env.NODE_ENV == 'production') {
        let message = err.message;
        let error = new ErrorHandler(message);
        //let error = {...err};
        
        if (err.name == 'ValidationError') {
            message = Object.values(err.errors).map(value => value.message)
            error = new ErrorHandler(message, 400);
        }

        if (err.name == 'CastError') {
            message = `Resource not found: ${err.path}`;
            error = new ErrorHandler(message, 400);
        }

        if (err.code == '11000') {
            message = `Duplicate ${Object.keys(err.keyValue)} error`;
            error = new ErrorHandler(message, 400)
        }

        if (err.name == 'JSONWebTokenError') {
            message = 'JSON Web Token Error, try again';
            error = new ErrorHandler(message, 400);
        }

        if (err.name == 'TokenExpiredError') {
            message = 'JSON Web Token expired, try again';
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode || err.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error',
        })
    }
}