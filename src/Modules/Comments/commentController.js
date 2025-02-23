import {Router} from 'express';
import * as commentValidation from './commentValidation.js'
import {validation} from '../../middlewares/validation.js'
import { asyncHandler } from '../../utils/ErrorHandling/asyncHandler.js';
import * as commentService from './commentService.js'
import {authentication,allowTo} from '../../middlewares/authMiddleware.js'
import {uploadCloud,fileValidation} from '../../utils/File Upload/multerUpload.js'

const router = Router({mergeParams: true});

router.post('/',authentication(),allowTo(['user']),
    uploadCloud().single('image'),
    validation(commentValidation.createCommentSchema),
    asyncHandler(commentService.createComment))


router.patch('/:commentId',authentication(),allowTo(['user']),
    uploadCloud().single('image'),
    validation(commentValidation.updateCommentSchema),
    asyncHandler(commentService.updateComment))

router.patch('/soft-delete/:commentId',authentication(),allowTo(['user','admin']),
    validation(commentValidation.softDelSchema),
    asyncHandler(commentService.softDelComment))

router.get('/',authentication(),allowTo(['user','admin']),
    validation(commentValidation.getAllCommentsSchema),
    asyncHandler(commentService.getAllComments))

router.patch('/likes-unlikes/:commentId',authentication(),allowTo(['user']),
    validation(commentValidation.likesSchema),
    asyncHandler(commentService.likes_unlikes))


router.post('/:commentId',authentication(),allowTo(['user']),
    uploadCloud().single('image'),
    validation(commentValidation.addReplySchema),
    asyncHandler(commentService.addReply))

router.delete('/deletComment/:commentId',authentication(),allowTo(['user','admin']),
    validation(commentValidation.deleteCommentSchema),
    asyncHandler(commentService.deleteComment))
export default router