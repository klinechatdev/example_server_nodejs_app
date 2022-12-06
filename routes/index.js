var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var { AccessToken, RoomServiceClient, Room } = require('livekit-server-sdk');
var admin = require('firebase-admin');
const { createRoomToken } = require('../services/roomService');
var serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});   
    

/* GET home page. */
router.get('/', function(req, res, next) {

  res.json({message: "Hola!"});
});


/* GET contacts list. */
router.get('/contacts', function(req, res, next) {
  try {
    let device_id = req.query.device_id;

    let rawdata = fs.readFileSync('database/contacts.json');
    let contacts = JSON.parse(rawdata);

    if(device_id){
       contacts.map((d,i)=>{
        if(d.id==device_id){
          delete contacts[i];
        }
       })
    }

    res.json({success: true, message: "Retrieved successfully!", data: contacts});
  } catch (error) {
    res.json({success: false, message: "Retrieved error!", data: []});
  }

});


/* POST contacts . */
router.post('/contacts', function(req, res, next) {

  try {
    let data = req.body;
    console.log("incoming request", data);
    if(!data.id || !data.name|| !data.token){
      return res.json({success: false, message: "Please provide all required fields!"});
    }

    let rawdata = fs.readFileSync('database/contacts.json');
    let contacts = JSON.parse(rawdata);
    let found = contacts.findIndex((v,i)=>v.id==data.id);
    let newContact = {
      ...data,
      created_at : Date.now()
    }
    if(found>-1){ // if we found device, overwrite
      contacts[found] = newContact
    }else{
      contacts.push(newContact);
    }
    let updateData = JSON.stringify(contacts);
    fs.writeFileSync('database/contacts.json', updateData);

    return res.json({success: true, message: "Contact Created successfully!"});
  } catch (error) {
    console.log(error);
    return res.json({success: false, message: "Contact creation error!"});
  }

});

/* DELETE contacts . */
router.delete('/contacts', function(req, res, next) {

  try {
    let id = req.body.id;
    if(!id){
      return res.json({success: false, message: "You must provide id to delete a contact"});
    }

    let rawdata = fs.readFileSync('database/contacts.json');
    let contacts = JSON.parse(rawdata);
    let found = contacts.findIndex((v,i)=>v.id==id);

    if(found>-1){
        contacts.splice(found, 1);
        let updateData = JSON.stringify(contacts);
        fs.writeFileSync('database/contacts.json', updateData);
    }
    
    res.json({success: true, message: "Contact deleted successfully!"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Contact deletion error!"});
  }

});


/* POST call_contact . */
router.post('/call_contact', async function(req, res, next) {

  try {
        
    const contact_id = req.body.contact_id;
    const caller_id = req.body.caller_id;
    const no_push = req.body.no_push ? req.body.no_push : "no";

    if(!contact_id || !caller_id){
        return res.status(400).json({success: false, message: "You must provide  contact_id and caller_id !"});
    }



    let rawdata = fs.readFileSync('database/contacts.json');
    let contacts = JSON.parse(rawdata);
    let targetIndex = contacts.findIndex((c,j)=>c.id==contact_id);
    let contact = targetIndex>-1 ? contacts[targetIndex] : null;
    if(!contact){
      return res.status(400).json({success: false, message: "Cannot find contact that you are calling!"});
    }
    let callerIndex = contacts.findIndex((c,k)=>c.id==caller_id);
    let caller = callerIndex>-1 ? contacts[callerIndex] : null;
    if(!caller){
      return res.status(400).json({success: false, message: "Cannot find caller in the database!"});
    }
    console.log(" calling from ", caller);
    console.log(" to", contact);
    //need to create room token here first 
    let room_token_contact = await createRoomToken(caller.id, contact.id);
    if(!room_token_contact){
      return res.status(500).json({success: false, message: "Something went wrong creating room token for contact"});
    }

    let room_token_caller = await createRoomToken(caller.id, caller.id);
    if(!room_token_caller){
      return res.status(500).json({success: false, message: "Something went wrong creating room token for caller"});
    }

    if(no_push=="no"){
    let message = {
        data: {
            room_token : room_token_contact,
            caller_name: caller.name
        },
        token: contact.token,
    };
    console.log("sending...");
    admin.messaging().send(message)
        .then((resp)=>{
            console.log(resp);
            return res.json({
                success : true,
                result: resp,
                room_token: room_token_caller,
                their_room_token: room_token_contact,
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

      }else{

        return res.json({
          success : true,
          result: resp,
          room_token: room_token_caller,
          their_room_token: room_token_contact,
          message: "Successfully sent call notification."
        });

      }


} catch (error) {
    
    return res.status(500).json({
        success : false,
        message: "Something went wrong sending call notification!",
        error: error
    });
}

});


module.exports = router;
