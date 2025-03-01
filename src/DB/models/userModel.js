import mongoose , {Schema, Types} from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

export const genders = {
    MALE:"male",
    FEMALE:"female"
}

export const roles= {
    USER:"user",
    ADMIN:"admin"
}

export const providers = {
    GOOGLE:"Google",
    SYSTEM:"System"
}

export const defaultImage ="upload/default-image.jpg";
export const defaultImageOnCloud = "https://res.cloudinary.com/dnjqcx9c2/image/upload/v1739060420/default-image_hgslbw.jpg"
export const defaultImagePublicId ="default-image_hgslbw";
const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        minLength:[3,"Name must be at least 3 characters"],
        maxLength:[20,"Name must be at most 20 characters"],
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String
    },
    gender:{
        type:String,
        enum:Object.values(genders),
        default:genders.MALE
    },
    role:{
        type:String,
        enum:Object.values(roles),
        default:roles.USER
    },
    provider:{
        type:String,
        enum:Object.values(providers),
        default:"System"
    },
    phone:String,
    address:String,
    image:{
       secure_url:{
           type:String,
           default:defaultImageOnCloud
       },
       public_id:{
           type:String,
           default:defaultImagePublicId
       }
    },
    coverImages:[String],
    DOB:Date,
    confirmationEmailOTP:String,
    forgetPasswordOTP:String,
    otpExpiration:Date,
    viewers:[{
        userId:{type:Types.ObjectId,ref:"user"},
        time:Date,
        views:{type:Number,default:0}
    }],
    confirmEmail:{
        type:Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    changeCredentials:Date,
    tempEmail:String,
    tempEmailOTP:String,
    friendRequests:[{type:Types.ObjectId, ref:"user"}],
    friends:[{type:Types.ObjectId, ref:"user"}]
},{timestamps:true})

userSchema.pre("save",function(next){
    if (this.isModified("password")){
        this.password = hash({plainText : this.password})
    }
    return next();
})


export const userModel = mongoose.model("user",userSchema)