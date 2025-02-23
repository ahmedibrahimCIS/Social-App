import * as dbService from "../../DB/dbService.js";
import { postModel } from "../../DB/models/postModel.js";
import {commentModel} from "../../DB/models/commentModel.js";
import cloudinary from "../../utils/File Upload/cloudinaryConfig.js"
import { roles } from "../../DB/models/userModel.js";


export const createComment = async (req,res,next) =>{
    const {postId} = req.params;

    const {text} = req.body;

    const post = await dbService.findOne({model:postModel,filter:{_id : comment.postId , isDeleted:false}});
    if(!post) return next(new Error("Post not found"),{cause:400});

    let image;
    if(req.file){
       
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, 
        {    
            folder:`posts/${post.createdBy}/post/${post.customId}/comments`
        })
        image = {secure_url , public_id};

    }

    const comment = await dbService.create({model:commentModel , data:{
        text,
        createdBy :req.user._id,
        postId:post._id,
        image
    }})

    return res.status(201).json({success:true , message:"comment created successfully", data:{comment}})

}

export const updateComment = async (req,res,next) =>{
    const {commentId} = req.params;

    const {text} = req.body;

    const comment = await dbService.findById({model:commentModel,id:commentId});
    if(!comment) return next(new Error("Comment not found"),{cause:400});

    const post = await dbService.findOne({model:postModel,filter:{_id : comment.postId , isDeleted:false}});
    if(!post) return next(new Error("Post not found"),{cause:400});

    if(post.createdBy.toString() !== req.user._id.toString()) return next(new Error("Unauthorized"),{cause:401});

    let image;
    if(req.file){
       
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, 
        {    
            folder:`posts/${post.createdBy}/post/${post.customId}/comments`
        })
        image = {secure_url , public_id};

        if(comment.image.public_id) await cloudinary.uploader.destroy(comment.image.public_id);
    }

    const updatedComment = await dbService.updateOne({model:commentModel , data:{
        text,
        image
    }})

    return res.status(201).json({success:true , message:"comment updated successfully", data:{comment}})

}

export const softDelComment = async(req, res, next) =>{
    const {commentId} =req.params;

    const comment = await dbService.findOne({model:commentModel , filter:{_id:commentId , isDeleted:false}});
    if(!comment) return next (new Error ("Comment not found"),{cause:404});

    const post = await dbService.findOne({model:postModel,filter:{_id : comment.postId , isDeleted:false}});
    if(!post) return next(new Error("Post not found"),{cause:400});

    const commentOwner = comment.createdBy.toString() === req.user._id.toString() 
    const postOwner =  post.createdBy.toString() === req.user._id.toString() 
    const admin = req.user.role === roles.ADMIN
    if(!(commentOwner || postOwner || admin) ) return next(new Error("Unauthorized"),{cause:401});

    const delComment = await dbService.updateOne({model:commentModel , data:{isDeleted:true , deletedBy : req.user._id}})
    

    return res.status(200).json({success:true , message:"Comment deleted successfully", data:{comment}})
}

export const getAllComments = async(req,res,next)=>{
    const {postId} =req.params;
    
    const post = await dbService.findOne({model:postModel,filter:{_id : postId , isDeleted:false}});
    if(!post) return next(new Error("Post not found"),{cause:400});

    const comments = await dbService.find({model:commentModel ,
         filter:{postId , isDeleted:false , parentComment: null},
         populate:[{path:"replies"}]})
    if(!comments) return next(new Error("There are no comments"),{cause:404});

    return res.status(200).json({success:true , data:{comments}})
}

export const likes_unlikes = async(req,res,next)=>{
    const {commentId} = req.params;
    const userId = req.user._id;

    const comment = await dbService.findOne({model:commentModel,filter:{_id:commentId , isDeleted:false}})

    if(!comment) return next(new Error("Comment not found"),{cause:400})

    if(comment.likes.includes(userId)){
        comment.likes.pull(userId)
    }
    else{
        comment.likes.push(userId)
    }

    await comment.save()

    return res.status(200).json({success:true , results:{comment}});
}
    
export const addReply = async (req,res,next) =>{
    const {postId,commentId} = req.params;

    const {text} = req.body;

    const comment = await dbService.findOne({model:commentModel,filter:{_id:commentId , isDeleted:false}});
    if(!comment) return next(new Error("Comment not found"),{cause:400});

    const post = await dbService.findOne({model:postModel,filter:{_id : comment.postId , isDeleted:false}});
    if(!post) return next(new Error("Post not found"),{cause:400});

    let image;
    if(req.file){
       
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, 
        {    
            folder:`posts/${post.createdBy}/post/${post.customId}/comments/${commentId._id}`
        })
        image = {secure_url , public_id};

    }

    const reply = await dbService.create({model:commentModel , data:{
        text,
        createdBy :req.user._id,
        postId:post._id,
        image,
        parentComment:comment._id
    }})

    return res.status(201).json({success:true , message:"Reply created successfully", data:{reply}})

}

export const deleteComment = async(req, res, next) =>{
    const {commentId} =req.params;

    const comment = await dbService.findOne({model:commentModel , filter:{_id:commentId , isDeleted:false}});
    if(!comment) return next (new Error ("Comment not found"),{cause:404});

    const post = await dbService.findOne({model:postModel,filter:{_id : comment.postId , isDeleted:false}});
    if(!post) return next(new Error("Post not found"),{cause:400});

    const commentOwner = comment.createdBy.toString() === req.user._id.toString() 
    const postOwner =  post.createdBy.toString() === req.user._id.toString() 
    const admin = req.user.role === roles.ADMIN
    if(!(commentOwner || postOwner || admin) ) return next(new Error("Unauthorized"),{cause:401});

    await comment.deleteOne();
    

    return res.status(200).json({success:true , message:"Comment deleted successfully"})
}
