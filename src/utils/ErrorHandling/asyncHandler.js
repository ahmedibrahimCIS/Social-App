export  const asyncHandler = (fn) => {
    return (req, res, next) => {
    fn(req, res, next).catch((error)=>{
        if (Object.keys(error) === 0) {
            return next(new Error (error.message , {cause:error.cause || 500}));
        }
        return next(error);
    })
}}

export const globalErrorHandler = (err, req, res, next) => {
    const status = err.cause || 500
     res.status(status).json({ message: err.message, stack: err.stack });
 }