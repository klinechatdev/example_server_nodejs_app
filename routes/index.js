var express = require('express');
var router = express.Router();
var fs = require('fs');

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


module.exports = router;
