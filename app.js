import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import {notFoundHandler} from './src/utils/ErrorHandling/notFoundHandler.js'
import {globalErrorHandler} from './src/utils/ErrorHandling/asyncHandler.js'
import authRouter from './src/Modules/Auth/authController.js'
import connectionDB from './src/DB/connection.js'
import userRouter from './src/Modules/User/userController.js'
import postRouter from './src/Modules/Post/postController.js'
import commentRouter from './src/Modules/Comments/commentController.js'
import morgan from 'morgan'
import adminRouter from './src/Modules/Admin/adminController.js'
import chatRouter from './src/Modules/Chat/chatController.js'



const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: true,
  handler: (req, res, next,options) => {
    return next(new Error(options.message , {cause:429}));
}})




const app = express()
const port = process.env.PORT || 3000

await connectionDB()

app.use(morgan('dev'))


// Apply the rate limiting middleware to all requests.
app.use(limiter)

app.use('/uploads',express.static('uploads'))
app.use(cors())
app.use(express.json())

app.use('/auth',authRouter)
app.use('/user',userRouter)
app.use('/post',postRouter)
app.use('/comments',commentRouter)
app.use('/admin', adminRouter)
app.use('/chat' , chatRouter) 

//Test Route
app.get("/", (req, res) => {
    res.json({ message: "API is working!" });
  });

app.use('/', notFoundHandler)

app.use(globalErrorHandler)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

export default app
