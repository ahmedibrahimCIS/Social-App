import {Router} from 'express';
import * as adminValidation from './adminValidation.js'
import {validation} from '../../middlewares/validation.js'
import { asyncHandler } from '../../utils/ErrorHandling/asyncHandler.js';
import * as adminService from './adminService.js'
import {authentication,allowTo} from '../../middlewares/authMiddleware.js'

const router =Router();


router.get('/',authentication(),
    allowTo(['admin']),
    asyncHandler(adminService.getUsersAndPosts))

router.patch('/role', authentication(),
    allowTo(['admin']),
    validation(adminValidation.changeRoleSchema),
    asyncHandler(adminService.changeRole))

export default router