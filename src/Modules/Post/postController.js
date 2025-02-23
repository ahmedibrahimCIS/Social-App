import { Router } from "express";
import * as postValidation from "./postValidation.js";
import { validation } from "../../middlewares/validation.js";
import { asyncHandler } from "../../utils/ErrorHandling/asyncHandler.js";
import * as postService from "./postService.js";
import { authentication, allowTo } from "../../middlewares/authMiddleware.js";
import { uploadCloud } from "../../utils/File Upload/multerUpload.js";
import commentRouter from '../Comments/commentController.js'

const router = Router()

router.use('/:postId/comment', commentRouter)

router.post('/create',authentication(),allowTo(['user']),uploadCloud().array('images',5),validation(postValidation.createPostSchema),asyncHandler(postService.createPost))
router.patch('/update/:postId',authentication(),allowTo(['user']),uploadCloud().array('images',5),validation(postValidation.updatePostSchema),asyncHandler(postService.updatePost))
router.patch('/soft-delete/:postId',authentication(),allowTo(['user','admin']),uploadCloud().array('images',5),validation(postValidation.softDelSchema),asyncHandler(postService.softDelPost))
router.patch('/restore-post/:postId',authentication(),allowTo(['user','admin']),uploadCloud().array('images',5),validation(postValidation.restorePostSchema),asyncHandler(postService.restorePost))
router.get('/getPost/:postId',authentication(),allowTo(['user','admin']),validation(postValidation.getSinglePostSchema),asyncHandler(postService.getSinglePost))
router.get('/active-posts',authentication(),allowTo(['user','admin']),asyncHandler(postService.activePosts))
router.get('/freezed-posts',authentication(),allowTo(['user','admin']),asyncHandler(postService.freezedPosts))
router.patch('/likes-unlikes/:postId',authentication(),allowTo(['user']),validation(postValidation.likesSchema),asyncHandler(postService.likes_unlikes))




export default router