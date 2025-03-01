import path from 'path'
import * as dbService from '../../DB/dbService.js'
import {defaultImageOnCloud,defaultImagePublicId, userModel} from '../../DB/models/userModel.js'
import { emailEmitter } from '../../utils/Email/emailEmit.js'
import {hash , compare} from '../../utils/hashing/hash.js'
import fs from 'fs'
import cloudinary from '../../utils/File Upload/cloudinaryConfig.js'
import {areFriends , requestExists} from './helper/friendReq.js'

export const getProfile = async (req, res, next) => {
    const user = await dbService.findOne({model:userModel,filter:{_id:req.user._id},populate:[{path:"viewers.userId",select:"userName email image"}]});
    return res.status(200).json({success:true , results:req.user});
}

export const shareProfile = async (req, res, next) => {
    const { profileId } = req.params;
    let user = undefined;

    if (profileId == req.user._id.toString()) {
        user = req.user;
    } else {
        // Check if the user has already viewed the profile
        const existingViewer = await dbService.findOne({
            model: userModel,
            filter: {
                _id: profileId,
                'viewers.userId': req.user._id
            },
            select: "viewers"
        });

        if (existingViewer) {
            // If the user has already viewed the profile, increment the view count
            user = await dbService.findOneAndUpdate({
                model: userModel,
                filter: {
                    _id: profileId,
                    'viewers.userId': req.user._id,
                    isDeleted: false
                },
                data: {
                    $inc: { 'viewers.$.views': 1 }
                },
                select: "userName email image"
            });
        } else {
            // If the user is viewing the profile for the first time, add them to the viewers array
            user = await dbService.findOneAndUpdate({
                model: userModel,
                filter: {
                    _id: profileId,
                    isDeleted: false
                },
                data: {
                    $push: {
                        viewers: {
                            userId: req.user._id,
                            time: Date.now(),
                            views: 1 
                        }
                    }
                },
                select: "userName email image"
            });
        }
    }

    return user ? res.status(200).json({ success: true, results: user }) : next(new Error("User not found"), { cause: 404 });
};

export const updateEmail = async (req, res, next) => {
    const {email} = req.body;

    if (await dbService.findOne({model:userModel,filter:{email}})) return next(new Error("Email already exists"),{cause:400})

    await dbService.updateOne({model:userModel,filter:{_id:req.user._id},data:{tempEmail:email}})

    emailEmitter.emit('sendEmail',req.user.email,req.user.userName,req.user._id);
    emailEmitter.emit('updateEmail',email,req.user.userName,req.user._id);


    return res.status(200).json({success:true});
 }

 export const updatePassword = async (req, res, next) => {
    const {oldPassword,newPassword} = req.body

        if (!compare({plainText : oldPassword , hashText : req.user.password})) 
            return next(new Error("Invalid password"),{cause:400})
            
   
    const hashedPassword = hash({plainText : newPassword})

    const user = await dbService.updateOne({model:userModel,filter:{_id:req.user._id},data:{password:hashedPassword, changeCredentials:Date.now()}})

    return res.status(200).json({success:true , message:"Password updated successfully"});
 }


 export const updateProfile = async (req, res, next) => {
    const user = await dbService.findOneAndUpdate({model:userModel,filter:{_id:req.user._id},data:req.body, options:{
        new:true , runValidators:true
    }})

    return res.status(200).json({success:true , message:"Profile updated successfully" , results:{user}});   
 }

 export const uploadProfilePicture = async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model:userModel,
        id:{_id: req.user._id},
        data:{image:req.file.path},
        options:{new:true , runValidators:true}
    })

    return res.status(200).json({success:true , message:"Profile picture uploaded successfully" , results:{user}});
}

export const uploadMultipleImages =async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model:userModel,
        id:{_id: req.user._id},
        data:{coverImages:req.files.map((obj)=>obj.path)},
        options:{new:true , runValidators:true}
    })

    return res.status(200).json({success:true , message:"Images uploaded successfully" , results:{user}});
}
export const deleteProfilePicture =   async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        mode:userModel,
        id:{_id:req.user._id}
    })
    const imagePath = path.resolve('.',user.image)
    fs.unlinkSync(imagePath)

    user.image = defaultImage
    await user.save()

    return res.status(200).json({success:true , message:"Profile picture deleted successfully" , results:{user}});

}

export const uploadCloudImage = async(req,res,next)=>{

    const user  = await dbService.findById({model:userModel,id:{_id:req.user._id}})

    if(!user) return next(new Error("User not found"),{cause:400})

    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder:`users/${user._id}/Profile Picture`
    })

    user.image = {
        secure_url,
        public_id}

    await user.save()
    return res.status(200).json({success:true,data:{user}})
}

export const deleteImageOnCloud = async(req,res,next)=>{

    const user  = await dbService.findById({model:userModel,id:{_id:req.user._id}})

    if(!user) return next(new Error("User not found"),{cause:400})

    const results = await cloudinary.uploader.destroy(user.image.public_id)

    if (results.result === "ok") {
        user.image = {
            secure_url: defaultImageOnCloud,
            public_id: defaultImagePublicId
        }
    }

    await user.save()
    return res.status(200).json({success:true,data:{user}})
}

export const sendFriendRequest = async (req, res, next) => {
    const {friendId} = req.params
    const user = req.user
    
    const friend = await dbService.findOne({model:userModel,filter:{_id:friendId , isDeleted:false}})
    if(!friend) return next(new Error("Friend not found"),{cause:400})

    if (areFriends(user , friend) || requestExists(user , friend)) 
        return next(new Error("Cannot send friend request"),{cause:400})
        
    friend.friendRequests.push(user._id)
    await friend.save()

    return res.status(200).json({message:"Request Sent Successfully" , success: true })

}

export const acceptFriendRequest = async (req, res, next) => {
    const {friendId} = req.params
    const user = req.user
    
    const friend = await dbService.findOne({model:userModel,filter:{_id:friendId , isDeleted:false}})
    if(!friend) return next(new Error("Friend not found"),{cause:400})

    if (areFriends(user , friend)) 
        return next(new Error("Already friends"),{cause:400})


    friend.friends.push(user._id)
    user.friends.push(friend._id)
    user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId)
    await user.save()
    await friend.save()         

    return res.status(200).json({message:"Request Accepted Successfully" , success: true })

}