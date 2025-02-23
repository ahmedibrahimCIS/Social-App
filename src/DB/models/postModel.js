import mongoose, { Schema, Types } from "mongoose";    

export const postSchema = new Schema({
    content:{
        type:String,
        required:true,
        minLength:3,
        maxLength:5000,
        trim:true,
        required:function(){
            return this.images?.length? false :true;
        }
    },
    images:[{
        secure_url:String,
        public_id:String
    }],
    createdBy:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    },
    deletedBy:{
        type:Types.ObjectId,
        ref:"user"
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
    customId:{
        type:String,
        unique:true
    }

},{timestamps:true ,toJSON:{virtuals:true}, toObject:{virtuals:true}})    

postSchema.virtual("comments" , {ref:"comment" , localField:"_id" , foreignField:"postId"})

export const postModel = mongoose.model("post" , postSchema)