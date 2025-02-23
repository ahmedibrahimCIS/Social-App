import {Router} from 'express';
import * as userValidation from './userValidation.js'
import {validation} from '../../middlewares/validation.js'
import { asyncHandler } from '../../utils/ErrorHandling/asyncHandler.js';
import * as userService from './userService.js'
import {authentication} from '../../middlewares/authMiddleware.js'
import {uploadCloud,fileValidation} from '../../utils/File Upload/multerUpload.js'

const router = Router();

router.get('/profile' ,authentication(),asyncHandler(userService.getProfile))
router.get('/profile/:profileId' ,validation(userValidation.shareProfileSchema),authentication(),asyncHandler(userService.shareProfile))
router.patch('/profile/email',validation(userValidation.updateEmailSchema), authentication(),asyncHandler(userService.updateEmail))
router.patch('/updatePassword',validation(userValidation.updatePasswordSchema),authentication(),asyncHandler(userService.updatePassword))
router.patch('/updateProfile',validation(userValidation.updateProfileSchema),authentication(),asyncHandler(userService.updateProfile))
// router.post('/profilePicture' ,authentication(),upload(fileValidation.images,'upload/user').single('image'),asyncHandler(userService.uploadProfilePicture))
// router.post('/multiPictures' ,authentication(),upload(fileValidation.images).array('images',3),asyncHandler(userService.uploadMultipleImages))
// router.delete('/DelProfilePicture' ,authentication(),upload(fileValidation.images,'upload/user').single('image'),asyncHandler(userService.deleteProfilePicture))
router.post('/uploadCloud' ,authentication(),uploadCloud().single('image'),asyncHandler(userService.uploadCloudImage))
router.delete('/deleteImageCloud' ,authentication(),uploadCloud().single('image'),asyncHandler(userService.deleteImageOnCloud))





export default router