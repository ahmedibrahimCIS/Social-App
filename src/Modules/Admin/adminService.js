import {postModel} from "../../DB/models/postModel.js"
import { userModel } from "../../DB/models/userModel.js"
import * as dbService from "../../DB/dbService.js"

export const getUsersAndPosts = async(req,res)=>{

    const results =await Promise.all(postModel.find({}),userModel.find({}))

    return res.status(200).json({message:"success" , results})
}

export const changeRole = async(req,res)=>{
    const {role,userId} = req.body;

    const user  =  await dbService.findOneAndUpdate({model:userModel,filter:{_id:userId},data:{role},options:{new:true}})

    if(!user) return next(new Error("User not found"),{cause:400})


    return res.status(200).json({success:true , message:"User role changed successfully" , results:{user}});
}