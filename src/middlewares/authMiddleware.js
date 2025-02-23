import {asyncHandler} from '../utils/ErrorHandling/asyncHandler.js'
import * as dbService from '../DB/dbService.js'
import {userModel} from '../DB/models/userModel.js'
import {verifyToken} from '../utils/token/genToken.js'

export const tokenTypes = {
    ACCESS:"access",
    REFRESH:"refresh"
}

export const decodedToken =  async ({authorization = "",tokenType = tokenTypes.ACCESS, next = {}}) => {
    
        const [bearer , token] = authorization.split(" ") || [];
    
        if (!token || !bearer) return next(new Error("Invalid token"),{cause:400})
    
        let ACCESS_SIGNATURE = undefined;
        let REFRESH_SIGNATURE = undefined;
    
        switch (bearer) {
            case "User":
                ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN
                REFRESH_SIGNATURE = process.env.USER_REFRESH_TOKEN
                break;
            case "Admin":
                ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN
                REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN
                break;
            default:
                break;
        }
        
        const decode = verifyToken({token, signature: tokenTypes.ACCESS ? ACCESS_SIGNATURE : REFRESH_SIGNATURE});
    
        const user = await dbService.findOne({model:userModel,filter:{_id:decode.id, isDeleted:false}})
        if(!user) return next(new Error("User not found"),{cause:400})
        
        if(user.changeCredentials?.getTime() >= decode.iat * 1000) return next(new Error("User credentials changed"),{cause:400})

        return user
}

export const authentication =  () => {
    return asyncHandler(async (req, res, next) => {
        const {authorization} = req.headers;
        if (!authorization) return next(new Error("unauthorized"),{cause:403})
        req.user= await decodedToken({authorization,tokenType: tokenTypes.ACCESS, next});
        return next();
    })
}


export const allowTo =  (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new Error("unauthorized"),{cause:403})
            
        }
        return next();
    })

}