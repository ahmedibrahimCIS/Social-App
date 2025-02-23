import { roles } from "../../DB/models/userModel.js"
import dbService from "../../DB/dbService.js"
import { userModel } from "../../DB/models/userModel.js"


export const changeRole = async (req,res,next)=>{
    const allRoles = Object.values(roles)

    const userReq = req.user

    const targetUser = await dbService.findById({model:userModel,id:{_id:req.body.userId}});

    const userReqRole = userReq.role
    const targetUserRole = targetUser.role

    const userReqRoleIndex = allRoles.indexOf(userReqRole)
    const targetUserRoleIndex = allRoles.indexOf(targetUserRole)

    if(userReqRoleIndex > targetUserRoleIndex) return next(new Error("Unauthorized"),{cause:400})

    return next();


}