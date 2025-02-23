import joi  from "joi";
import { Types } from "mongoose";

export const isValidId = (value,helper) =>{
    return Types.ObjectId.isValid(value)? true : helper.message('Invalid id');
}

export const generalFields = {
        userName:joi.string().min(3).max(20),
        email:joi.string().email(),
        password:joi.string().min(6).max(20),
        confirmPassword:joi.string().equal(joi.ref('password')).min(6).max(20),
        gender:joi.string().valid('male','female'),
        role:joi.string().valid('user','admin'),
        phone:joi.string().pattern(new RegExp('^[0-9]{10}$')),
        DOB:joi.date().less('now'),
        code:joi.string().pattern(new RegExp('^[0-9]{6}$')),
        id:joi.string().custom(isValidId),
        fileObject:
           { fieldname:joi.string().required(),
            originalname:joi.string().required(),
            encoding:joi.string().required(),
            mimetype:joi.string().required(),
            size:joi.number().required(),
            destination:joi.string().required(),
            filename:joi.string().required(),
            path:joi.string().required()
           }
    
}

export const validation = (schema)=>{
    return (req,res,next)=>{
        const data = {...req.body,...req.params,...req.query};
        if (req.file || req.files?.length) {
            data.file = req.file || req.files;
        }
        const results = schema.validate(data , {abortEarly:false});
        if(results.error){
            const errorMessage = results.error.details.map((obj)=>{ obj.message});
            return next(new Error(errorMessage, {cause:400}));
        }
        return next();
    }
}

