import joi from "joi"
import {generalFields} from "../../middlewares/validation.js"

export const createPostSchema = joi.object({
    content:joi.string().min(2).max(5000),
    file: joi.array().items(joi.object(generalFields.fileObject))
}).or('content','file')

export const updatePostSchema =joi.object({
    postId: generalFields.id.required(),
    content:joi.string().min(2).max(5000),
    file: joi.array().items(joi.object(generalFields.fileObject))
}).or('content','file')

export const softDelSchema =joi.object({postId: generalFields.id.required()})

export const restorePostSchema =joi.object({postId: generalFields.id.required()})

export const getSinglePostSchema =joi.object({postId: generalFields.id.required()})
export const likesSchema = joi.object({postId: generalFields.id.required()})

