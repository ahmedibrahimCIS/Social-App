import { generalFields } from "../../middlewares/validation.js"
import joi from "joi"

export const changeRoleSchema = joi.object({
    userId:generalFields.id.required(),
    role:generalFields.role.required()
})