var { AccessToken, RoomServiceClient, Room } = require('livekit-server-sdk');


async function createRoomToken(roomName, participantId){
    try {
        const at = new AccessToken(process.env.API_KEY, process.env.SECRET_KEY, {
            identity: participantId,
          });
          at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
          const token = at.toJwt();
        return token;
    } catch (error) {
        console.log("cannot create room token", error);
        return null;
    }
  
}


module.exports = {
    createRoomToken
}