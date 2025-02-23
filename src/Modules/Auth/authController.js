import {Router} from 'express';
import * as authValidation from './authValidation.js'
import {validation} from '../../middlewares/validation.js'
import { asyncHandler } from '../../utils/ErrorHandling/asyncHandler.js';
import * as authService from './authService.js'

const router =Router();

router.post('/register' , validation(authValidation.registerSchema),asyncHandler(authService.register))
router.patch('/verify-email' , validation(authValidation.confirmEmailSchema),asyncHandler(authService.verifyEmail))
router.post('/login' , validation(authValidation.loginSchema),asyncHandler(authService.login))
router.get('/refresh-token' , asyncHandler(authService.refresh_token))
router.patch('/forgert-password' , validation(authValidation.forgetPasswordSchema),asyncHandler(authService.forget_password))
router.patch('/reset-password' , validation(authValidation.resetPasswordSchema),asyncHandler(authService.reset_password))
router.post('/loginWithGmail' , asyncHandler(authService.loginWithGmail))


export default router