import {userModel} from '../../DB/models/userModel.js'
import * as dbService from '../../DB/dbService.js'
import {hash,compare} from '../../utils/hashing/hash.js'
import {emailEmitter} from '../../utils/Email/emailEmit.js'
import {generateToken, verifyToken} from '../../utils/token/genToken.js'
import {roles} from '../../DB/models/userModel.js'
import {OAuth2Client}from 'google-auth-library';
import {providers} from '../../DB/models/userModel.js'

export const register = async(req,res,next)=>{
   const {userName , email , password ,confirmPassword, gender , role} = req.body

   if (password !== confirmPassword) {
    return next (new Error("Passwords do not match"),{cause:400})
   }

   const user = await dbService.findOne({model:userModel,filter:{email}})
   if(user) return next(new Error("User already exists"),{cause:400})

    // const hashedPassword = hash({plainText : password})

    await dbService.create({model:userModel,data:{userName , email , password:hashedPassword , gender , role}})

    emailEmitter.emit('sendEmail',email,userName);

    return res.status(201).json({message:"User registered successfully"});

}

export const verifyEmail = async(req,res,next)=>{

     const {email , otp} = req.body

     const user = await dbService.findOne({model:userModel,filter:{email}})
     if(!user) return next(new Error("User not found"),{cause:400})

     if (user.confirmEmail == true) return next(new Error("Email already verified"),{cause:400})

     const isValid = compare({plainText : otp , hashText : user.confirmationEmailOTP})
     if(!isValid) return next(new Error("Invalid OTP"),{cause:400})

     await dbService.updateOne({model:userModel,filter:{email},data:{confirmEmail:true , $unset:{confirmationEmailOTP:""}}})
 
     return res.status(200).json({message:"Email verified successfully"});
 
 }


 export const login = async(req,res,next)=>{

    const {email , password} = req.body

    const user = await dbService.findOne({model:userModel,filter:{email}})
    if(!user) return next(new Error("User not found"),{cause:400})

    const isValid = compare({plainText : password , hashText : user.password})
    if(!isValid) return next(new Error("Invalid email or password"),{cause:400})

    const access_token = generateToken({payload:{id:user._id},
        signature: user.role == roles.USER 
        ? process.env.USER_ACCESS_TOKEN 
        : process.env.ADMIN_ACCESS_TOKEN,options:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION}})

        const refresh_token = generateToken({payload:{id:user._id},
            signature: user.role == roles.USER 
            ? process.env.USER_REFRESH_TOKEN 
            : process.env.ADMIN_REFRESH_TOKEN,options:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION}})
    

    return res.status(200).json({message:"User logged in successfully" , tokens:{access_token,refresh_token}});
 }

 export const refresh_token = async(req,res,next)=>{

    const {authorization} = req.headers;

    const user = await decodedToken(authorization,tokenType.REFRESH ,next);
    const access_token = generateToken({payload:{id:user._id},
        signature: user.role == roles.USER ? 
        process.env.USER_ACCESS_TOKEN 
        : process.env.ADMIN_ACCESS_TOKEN,options:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION}})

    const refresh_token = generateToken({payload:{id:user._id},
        signature: user.role == roles.USER ?
         process.env.USER_REFRESH_TOKEN 
         : process.env.ADMIN_REFRESH_TOKEN, options:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION}})
    

    return res.status(200).json({success:true, tokens:{access_token,refresh_token}});

 }

 export const forget_password = async(req,res,next)=>{

    const {email} = req.body;

    const user = await dbService.findOne({model:userModel,filter:{email}})
    if(!user) return next(new Error("User not found"),{cause:400})

    emailEmitter.emit('forgetPassword',email,user.userName);

    return res.status(200).json({success:true});

 }

 export const reset_password = async(req,res,next)=>{

    const {email , otp , password } = req.body

   
    const user = await dbService.findOne({model:userModel,filter:{email}})
    if(!user) return next(new Error("User not found"),{cause:400})

    if (user.otpExpiration && new Date() > user.otpExpiration) {
        return next(new Error("OTP has expired"), { cause: 400 });
    }
    

    const isValid = compare({plainText : otp , hashText : user.forgetPasswordOTP})
    if(!isValid) return next(new Error("Invalid OTP"),{cause:400})

    const hashedPassword = hash({plainText : password})

    await dbService.updateOne({model:userModel,filter:{email},data:{password:hashedPassword , $unset:{forgetPasswordOTP:""}}})

    return res.status(200).json({success:true});

 }

 export const loginWithGmail = async(req,res,next)=>{

    const {idToken} = req.body;
   
    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.CLIENT_ID,  
      });
      const payload = ticket.getPayload();
      return payload;
    }
    const {name,email,picture,email_verified} = await verify();

    if (!email_verified) return next(new Error("Email not verified"),{cause:400})

    let user = await dbService.findOne({model:userModel,filter:{email , isDeleted:false}})

    if (user?.provider == providers.SYSTEM) {
        return next(new Error("User already exists"),{cause:400})
        
    }
    if(!user){
        user = await dbService.create({model:userModel,data:{userName:name , email , image:picture}})
    }

    const access_token = generateToken({payload:{id:user._id},
        signature: user.role == roles.USER 
        ? process.env.USER_ACCESS_TOKEN 
        : process.env.ADMIN_ACCESS_TOKEN,options:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION}})

        const refresh_token = generateToken({payload:{id:user._id},
            signature: user.role == roles.USER 
            ? process.env.USER_REFRESH_TOKEN 
            : process.env.ADMIN_REFRESH_TOKEN,options:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION}})
    
    return res.status(200).json({success:true , tokens:{access_token,refresh_token}});
    

}
