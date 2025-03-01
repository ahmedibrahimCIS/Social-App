export const areFriends = function (user ,friend){
    if (friend.friends.map(String).includes(user._id.toString()) ||
        user.friends.map(String).includes(friend._id.toString())) 
        return true
    

    return false
}

export const requestExists = function (user ,friend){
    if (friend.friendRequests.map(String).includes(user._id.toString()) ||
        user.friendRequests.map(String).includes(friend._id.toString())) 
        return true
    

    return false
}
