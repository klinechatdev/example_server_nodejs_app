var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var { AccessToken, RoomServiceClient, Room } = require('livekit-server-sdk');
var admin = require('firebase-admin');
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
router.post('/call_contact', function(req, res, next) {

  try {
        
    const contact_id = req.body.contact_id;
    const caller_id = req.body.caller_id;

    if(!contact_id || !caller_id){
        return res.status(400).json({success: false, message: "You must provide  contact_id and caller_id !"});
    }


    let room_token = "test token";

    let rawdata = fs.readFileSync('database/contacts.json');
    let contacts = JSON.parse(rawdata);
    let targetIndex = contacts.findIndex((c,j)=>c.id==contact_id);
    let contact = targetIndex>-1 ? contacts[targetIndex] : null;
    if(!contact){
      return res.status(400).json({success: false, message: "Cannot find contact that you are calling!"});
    }

    console.log("calling to",contact);
    //need to create room token here first 


    let message = {
        data: {
            room_token : room_token
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
