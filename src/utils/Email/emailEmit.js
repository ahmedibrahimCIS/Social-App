import EventEmitter from 'events';
import { sendEmail,subject } from './sendEmail.js';
import { customAlphabet } from 'nanoid';
import {hash} from '../hashing/hash.js';
import {userModel} from '../../DB/models/userModel.js';
import {temp } from './generateHtml.js';
import * as dbService from '../../DB/dbService.js';


export const emailEmitter = new EventEmitter();

emailEmitter.on('sendEmail',async(email,userName,id)=>{
    await sendCode({data:{email,userName , id},subjectType:subject.VERIFY_EMAIL});

});

emailEmitter.on('forgetPassword',async(email,userName,id)=>{
   await sendCode({data:{email,userName , id},subjectType:subject.RESET_PASSWORD});

});

emailEmitter.on('updateEmail',async(email,userName,id)=>{
    await sendCode({data:{email,userName , id},subjectType:subject.UPDATE_EMAIL});
 
 });
export const sendCode = async(data ={},subjectType= subject.VERIFY_EMAIL)=>{

    const {userName , email , id} = data
    const otp = customAlphabet('1234567890', 6)();
    const hashedOTP = hash({plainText : otp});
    let updateData = {};

    switch(subjectType){
        case subject.VERIFY_EMAIL:
            updateData = {confirmationEmailOTP:hashedOTP};
            break;
        case subject.UPDATE_EMAIL:
            updateData = {tempEmailOTP:hashedOTP}; 
            break;
        case subject.RESET_PASSWORD:
            updateData = {forgetPasswordOTP:hashedOTP}; 
            break;
    }

    await dbService.updateOne ({model:userModel,filter:{_id: id},data:{$set:updateData}});
    await sendEmail({to: email , subject: subjectType, html:temp(otp,userName,subjectType)});

}