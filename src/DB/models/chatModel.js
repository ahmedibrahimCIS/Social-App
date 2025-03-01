import mongoose ,{ Schema ,Types } from "mongoose";


const messageSchema = new Schema({
    sender:{type:Types.ObjectId , ref:"user",required:true},
    content:{type:String,required:true}
},{timestamps:true})

const chatSchema = new Schema({
    users:{
        type:[{type: Types.ObjectId , ref:"user"}],
        validate:{
            validator:(value)=> value.length === 2,
            message: "array must contain 2 users"
        }
    },
    messages:[messageSchema]

},{timestamps:true})


const chatModel = mongoose.model("chat",chatSchema);
export default chatModel