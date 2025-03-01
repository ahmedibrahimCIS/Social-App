import * as dbService from '../../DB/dbService.js'
import { userModel } from '../../DB/models/userModel.js'
import chatModel from '../../DB/models/chatModel.js'
import { populate } from 'dotenv';

export  const getChat = async(req,res,next) =>{
    const {friendId} = req.params;

    const friend = await dbService.findOne({model:userModel,filter:{_id:friendId , isDeleted:false}})
    if(!friend) return next(new Error("Friend not found"),{cause:400})

    const chat = await dbService.findOne({model:chatModel,filter:{users:{$all:[req.user._id,friend._id],populate:[{path: "users"}]}}})
    if(!chat) return next(new Error("Chat not found"),{cause:400})

    return res.status(200).json({success:true , results:{chat}});
    
}

export const sendMessage = async (req, res, next) => {
    const {friendId} = req.params
    const {content} = req.body
    
    const friend = await dbService.findOne({model:userModel,filter:{_id:friendId , isDeleted:false}})
    if(!friend) return next(new Error("Friend not found"),{cause:400})

    let chat = await dbService.findOne({model:chatModel,filter:{users:{$all:[req.user._id,friendId]}}})
    if(!chat) {
        chat = await dbService.create({model:chatModel,data:{users:[req.user._id,friendId],messages:[{sender:req.user._id , content}]}})
    }
    else{  
        chat.messages.push({sender:req.user._id , content})
        await chat.save()
    }

    let chatPopulated = await dbService.findOne({model:chatModel,filter:{_id:chat._id},populate:[{path: "users"}]})

    return res.status(200).json({success:true , results:{chatPopulated}});
}