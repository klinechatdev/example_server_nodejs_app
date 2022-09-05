var express = require('express');
var router = express.Router();
var path = require('path');
var { AccessToken, RoomServiceClient, Room } = require('livekit-server-sdk');
var admin = require('firebase-admin');
var serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));


    


/**
 * these routes are solely for testing each function
*/


/* POST create token to join room */
router.post('/create_token', function(req, res, next) {

    try {
        
    
    const roomName = req.body.room;
    const participantName = req.body.participant;

    if(!roomName || !participantName){
        return res.status(400).json({
            success : false,
            message: "Room and Participant must be provided!"
        });
    }

    const at = new AccessToken(process.env.API_KEY, process.env.SECRET_KEY, {
        identity: participantName,
      });
      at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
      const token = at.toJwt();

      return res.json({
        success : true,
        token : token,
        room: roomName,
        participant: participantName,
        message: "Successfully generated token to join room"
      });

    } catch (error) {
        return res.status(500).json({
            success : false,
            message: "Something went wrong creating token!",
            error: error
        });
    }
});


/* POST create  room */
router.post('/create_room', async function(req, res, next) {

    try {
        
    
    const roomName = req.body.room;

    if(!roomName){
        return res.status(400).json({
            success : false,
            message: "Room Name must be provided!"
        });
    }

    const svc = new RoomServiceClient(process.env.LIVEKIT_HOST, process.env.API_KEY, process.env.SECRET_KEY);

        // create a new room
        const opts = {
            name: roomName,
            emptyTimeout: 10 * 60,  // timeout in seconds
            maxParticipants: 10,
        };

     let room = await svc.createRoom(opts);

      return res.json({
        success : true,
        room: room,
        message: "Successfully created room"
      });

    } catch (error) {

        return res.status(500).json({
            success : false,
            message: "Something went wrong creating room!",
            error: error
        });
    }
});


/* POST list existing  rooms */
router.post('/list_rooms', async function(req, res, next) {

    try {
        
    
    const svc = new RoomServiceClient(process.env.LIVEKIT_HOST, process.env.API_KEY, process.env.SECRET_KEY);

    let rooms = await svc.listRooms();

      return res.json({
        success : true,
        rooms: rooms,
        message: "Successfully fetched rooms"
      });

    } catch (error) {
        
        return res.status(500).json({
            success : false,
            message: "Something went wrong fetching rooms!",
            error: error
        });
    }
});


/* POST Send Call Noti */
router.post('/send_fcm_noti', async function(req, res, next) {

    try {
        
        const deviceToken = req.body.device_token;
        const room_token = req.body.room_token;

        if(!deviceToken  || !room_token){
            return res.status(400).json({success: false, message: "You must provide  room token and device token!"});
        }


        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });   

        let message = {
           
            data: {
                room_token : room_token
            },
            topic: "calls",
            token: deviceToken,
        };
        console.log("sending...");
        admin.messaging().send(message)
            .then((resp)=>{
                console.log(resp);
                return res.json({
                    success : true,
                    result: resp,
                    message: "Successfully sent call notification."
                  });
            })
            .catch((err)=>{

                return res.status(500).json({
                    success : false,
                    message: "Something went wrong sending call notification",
                    error: err
                  });
            });




    } catch (error) {
        
        return res.status(500).json({
            success : false,
            message: "Something went wrong sending call notification!",
            error: error
        });
    }
});



module.exports = router;
