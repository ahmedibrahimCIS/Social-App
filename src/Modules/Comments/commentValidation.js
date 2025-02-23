import joi from "joi"
import {generalFields} from "../../middlewares/validation.js"

export const createCommentSchema = joi.object({
    text:joi.string().min(3).max(5000),
    file: joi.object(generalFields.fileObject),
    postId: generalFields.id.required(),

}).or('text','file')

export const updateCommentSchema = joi.object({
    commentId: generalFields.id.required(),
    text:joi.string().min(3).max(5000),
    file: joi.object(generalFields.fileObject)
}).or('text','file')

export const softDelSchema =joi.object({commentId: generalFields.id.required()})

export const getAllCommentsSchema =joi.object({postId: generalFields.id.required()})

export const likesSchema=joi.object({commentId: generalFields.id.required()})

export const addReplySchema = joi.object({
    text:joi.string().min(3).max(5000),
    file: joi.object(generalFields.fileObject),
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),

}).or('text','file')

export const deleteCommentSchema =joi.object({commentId: generalFields.id.required()})