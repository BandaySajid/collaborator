// SequelizeUniqueConstraintError
export default function errorController(err) {
    let finalError;
    let statusCode;
    switch (err.name) {
        case 'SequelizeValidationError':
            finalError = err.errors[0].message;
            statusCode = 400;
            break;
        case 'SequelizeUniqueConstraintError':
            finalError = `Data with ${err.errors[0].path} "${err.errors[0].value}" already exists`;
            statusCode = 400;
            break;
        default:
            finalError = 'An error occured'
            statusCode = 500;
    };

    return {
        error: finalError,
        statusCode
    }
};