import cloudinary from "../../utils/File Upload/cloudinaryConfig.js"
import {nanoid} from "nanoid"
import * as dbService from "../../DB/dbService.js"
import {postModel} from "../../DB/models/postModel.js"
import { roles } from "../../DB/models/userModel.js"
export const createPost = async(req,res,next)=>{
    const {content} = req.body
    const allImages =[];
    let customId;
    if (req.files.length) {
        customId = nanoid(5);
        for (const file of req.files) {
            const {secure_url , public_id} = await cloudinary.uploader.upload(file.path,{
                folder:`posts/${req.user._id}/post/${customId}`
            })
            allImages.push({secure_url , public_id})
        }
    }
    const post = await dbService.create({model:postModel,data:{content,images:allImages,customId,createdBy:req.user._id}})
    return res.status(200).json({success:true , message:"Post created successfully" , results:{post}});
}

export const updatePost = async(req,res,next)=>{
    const {content} = req.body
    const {postId} = req.params
    const post = await dbService.findOne({model:postModel,filter:{_id:postId , createdBy:req.user._id}})
    if(!post) return next(new Error("Post not found"),{cause:400})
    
    const allImages =[]
    if (req.files.length) {
        for (const file of req.files) {
            for (const file of post.images) {
                await cloudinary.uploader.destroy(file.public_id)
            }
            const {secure_url , public_id} = await cloudinary.uploader.upload(file.path,{
                folder:`posts/${req.user._id}/post/${post.customId}`
            })
            allImages.push({secure_url , public_id})
        }
        post.images = allImages
    }
    post.content = content ? content : post.content;
    await post.save()
    return res.status(200).json({success:true , message:"Post updated successfully" , results:{post}});
}

export const softDelPost = async(req,res,next)=>{
    const {postId} = req.params
    const post = await dbService.findById({model:postModel,id:{_id: postId }})
    if(!post) return next(new Error("Post not found"),{cause:400})

    if(post.createdBy.toString() === req.user._id.toString() || req.user.role === roles.ADMIN) {

        post.isDeleted = true;
        post.deletedBy = req.user._id
        await post.save()
        return res.status(200).json({success:true , message:"Post deleted successfully" , results:{post}});

    }
    else{
        return next(new Error("Unauthorized"),{cause:400})
    }

    
}

export const restorePost = async(req,res,next)=>{
    const {postId} = req.params

    const post = await dbService.findOne({model:postModel,filter:{_id: postId, isDeleted:true}})

    if(!post) return next(new Error("Post not found"),{cause:400})

        // Check if the user is authorized to restore the post (any admin or the owner of the post)
    if (post.deletedBy.toString() !== req.user._id.toString() && req.user.role !== roles.ADMIN) {
            return next(new Error("Unauthorized"), { cause: 403 });
        }

    const restoredPost = await dbService.findOneAndUpdate({model:postModel,filter:{_id: postId, isDeleted:true ,deletedBy:req.user._id},
        data:{isDeleted:false ,$unset:{deletedBy:" "} },options:{new:true }})
    
    

    
    return res.status(200).json({success:true , message:"Post restored successfully" , results:{restoredPost}});
}

export const getSinglePost = async(req,res,next)=>{
    const {postId} = req.params
    const post = await dbService.findOne({model:postModel,filter:{_id: postId, isDeleted:false },populate:[
        {path:"createdBy",select:"userName image -_id"},
        {path:"comments",select:"text image -_id",populate:[{path:"createdBy",select:"userName image -_id"}]}
    ]})
    if(!post) return next(new Error("Post not found"),{cause:400})

    
    return res.status(200).json({success:true , results:{post}});
}

export const activePosts = async(req,res,next)=>{
    //Query Stream
    const cursor = postModel.find({isDeleted:false}).cursor()

    let results = []

    for (let post = await cursor.next(); post != null; post = await cursor.next()) {
       const comment = await dbService.find({model:commentModel,
        filter:{postId:post._id , isDeleted:false},
        select:"text image -_id",

    })

       results.push({post , comment})
        
    }

 return res.status(200).json({success:true , data:{results}});
}

export const freezedPosts = async(req,res,next)=>{
    let posts;
    if(req.user.role === roles.ADMIN) {

       posts = await dbService.find({model:postModel,
        filter:{isDeleted:true},
        populate:[{path:"createdBy",select:"userName image -_id"}]})
       
    }
    else{

        posts = await dbService.find({model:postModel,
            filter:{isDeleted:true , createdBy:req.user._id},
            populate:[{path:"createdBy",select:"userName image -_id"}]})
       
    }
 return res.status(200).json({success:true , data:{posts}});
}

export const likes_unlikes = async(req,res,next)=>{
    const {postId} = req.params;
    const userId = req.user._id;

    const post = await dbService.findOne({model:postModel,filter:{_id:postId , isDeleted:false}})

    if(!post) return next(new Error("Post not found"),{cause:400})

    if(post.likes.includes(userId)){
        post.likes.pull(userId)
    }
    else{
        post.likes.push(userId)
    }

    await post.save()

    return res.status(200).json({success:true , results:{post}});
}