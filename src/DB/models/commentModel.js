import mongoose, { Schema, Types } from "mongoose";    
import cloudinary  from '../../utils/File Upload/cloudinaryConfig.js'

export const commentSchema = new Schema({
    text:{
        type:String,
        required:true,
        minLength:3,
        maxLength:5000,
        trim:true,
        required: function(){
            return this.image?.length ? false :true;
         }
    },
    image:{
        secure_url:String,
        public_id:String
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    },
    postId:{
        type:Types.ObjectId,
        ref:"post",
        required:true
    },
    deletedBy:{
        type:Types.ObjectId,
        ref:"user"
    },
    parentComment:{
        type:Types.ObjectId,
        ref:"comment"
    },
    likes:[
        {
            type:Types.ObjectId,
            ref:"user"
        }
    ],
    isDeleted:{
        type:Boolean,
        default:false
    },

},{timestamps:true , toJSON:{virtuals:true}, toObject:{virtuals:true}})

commentSchema.post('deleteOne',{document:true,query:false}, async function (doc,next) {
    if (doc.image.public_id) {
        await cloudinary.uploader.destroy(doc.image.public_id);
    }
    const replies = await this.constructor.find({parentComment:doc._id})

    if(replies.length > 0){
        for (const reply of replies) {
            await reply.deleteOne()
            
        }
    }
    return next()
})

commentSchema.virtual("replies" , {
    ref:"comment",
    localField:"_id",
    foreignField:"parentComment"
})

export const commentModel = mongoose.model("comment" , commentSchema)