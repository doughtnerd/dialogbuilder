var utils = require(global.appRoot + "/server/utils/utils.js");
var express = require('express');
var mongo = require('mongodb');
var router = express.Router();
  
var MONGO_URI = 'mongodb://admin:Holylaw1@ds017886.mlab.com:17886/dialogdb';

router.route('/')
  .get(function(req, res){
    if(req.query.dialogs!=undefined){
      res.json(formatDialog(JSON.parse(req.query.dialogs).dialogs));
    } else {
      res.json({message:"No dialog data found"});
    }
  })
  .post(function(req,res){
    var newEntry ={original: req.body.dialogs};
      if(verifySubmission(newEntry, res)){
          newEntry.formatted = formatDialog(newEntry.original);
          submitEntry(newEntry, res);
      }
  })
  .put(function(req,res){
    
  })
  .delete(function(req,res){
    
  });
    
function submitEntry(entry, res){
  var error;
  mongo.connect(MONGO_URI, function(err, db){
    if(!err){
      var collection = db.collection('dialogs');
      collection.insert(entry, function(err, data){
        if(!err){
          res.send({res:true, message:"Successful"});
          console.log("Successful submission");
        } else {
          console.log("error inserting.");
          res.send({res:false, message:"Failed to insert new entry into database " + err});
        }
      });
      db.close();
    } else {
      console.log("error connecting." + err);
      res.send({res:false, message:"Could not connect to submission database."});
    }
  });
}    

//Check for floating/unconnected dialogs.
//Check for blank fields. This might solve the floating problem.
//Check for circular dependencies.
function verifySubmission(entry, res){
  var i = 0;
  for(var name in entry) {
     if(entry[name]==false){
       res.send({res:false, message:"Property "  + name + " in Dialog " + i + " was empty."});
       return false;
     }
  }
  return true;
}

function formatDialog(dialog){
  var result = {};
  var marked = new Array(dialog.length);
  console.log(dialog[0].dialogText);
  var copy = JSON.parse(JSON.stringify(dialog));
  for(var i = 0; i < copy.length; i++){
    copy[i].id=i;
    console.log(copy[i].dialogText);
    copy[i].dialogText = copy[i].dialogText.replace(/\n/g, '$');
  }
  return copy;
}
/*
function formatDialog(dialog){
  var result = {};
  var marked = new Array(dialog.length);
  var copy = JSON.parse(JSON.stringify(dialog));
  for(var i = 0; i < copy.length; i++){
    copy[i].id=i;
  }
  for(i = 0; i < copy.length; i++){
    var d = copy[i];
    if(d.hasOwnProperty('choices')){
      var arr = d.choices;
      for(var j = 0; j < arr.length; j++){
        var index = arr[j].nextDialog;
        arr[j].nextDialog = copy[index];
        marked[index] = true;
      }
    } else {
      d.choices = [];
    }
  }
  for(i = 0; i < copy.length; i++){
    if(marked[i]!=true){
      result = copy[i];
    }
  }
  
  return result;
}
*/
module.exports=router;