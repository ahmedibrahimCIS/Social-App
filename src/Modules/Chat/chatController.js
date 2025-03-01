import {Router} from 'express';
import * as chatValidation from './chatValidation.js'
import {validation} from '../../middlewares/validation.js'
import {authentication} from '../../middlewares/authMiddleware.js'
import { asyncHandler } from '../../utils/ErrorHandling/asyncHandler.js';
import * as chatService from './chatService.js'

const router =Router();

router.get('/:friendId' , authentication(),validation(chatValidation.getChatSchema),asyncHandler(chatService.getChat))
router.post('/message/:friendId' , authentication(),validation(chatValidation.sendmesasgeSchema),asyncHandler(chatService.sendMessage))


export default router