import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const shareProfileSchema = joi.object({
    profileId: generalFields.id.required()
    
}).required()

export const updateEmailSchema = joi.object({
    email:generalFields.email.required()
}).required()

export const updatePasswordSchema = joi.object({
    oldPassword:generalFields.password.required(),
    newPassword:generalFields.password.not(joi.ref('oldPassword')).required(),
    confirmPassword:generalFields.confirmPassword.equal(joi.ref('newPassword')).required()
}).required()

export const updateProfileSchema = joi.object({
    userName:generalFields.userName,
    gender:generalFields.gender,
    phone:generalFields.phone,
    DOB:generalFields.DOB,
    role:generalFields.role
}).required()