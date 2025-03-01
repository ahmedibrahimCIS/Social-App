import joi from 'joi'
import {generalFields} from "../../middlewares/validation.js"

export const getChatSchema = joi.object({
    friendId:generalFields.id.required()
}).required()


export const sendmesasgeSchema = joi.object({
    friendId:generalFields.id.required(),
    content:joi.string().required()
}).required()