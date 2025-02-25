import express from 'express'
import cors from 'cors'
import {notFoundHandler} from './src/utils/ErrorHandling/notFoundHandler.js'
import {globalErrorHandler} from './src/utils/ErrorHandling/asyncHandler.js'
import authRouter from './src/Modules/Auth/authController.js'
import connectionDB from './src/DB/connection.js'
import userRouter from './src/Modules/User/userController.js'
import postRouter from './src/Modules/Post/postController.js'
import commentRouter from './src/Modules/Comments/commentController.js'
import morgan from 'morgan'
import adminRouter from './src/Modules/Admin/adminController.js'



const app = express()
const port = process.env.PORT || 3000

await connectionDB()

app.use(morgan('dev'))

app.use('/uploads',express.static('uploads'))
app.use(cors())
app.use(express.json())

app.use('/auth',authRouter)
app.use('/user',userRouter)
app.use('/post',postRouter)
app.use('/comments',commentRouter)
app.use('/admin', adminRouter)

//Test Route
app.get("/", (req, res) => {
    res.json({ message: "API is working!" });
  });

app.use('/', notFoundHandler)

app.use(globalErrorHandler)

export default app
// app.listen(port, () => console.log(`App listening on port ${port}!`))