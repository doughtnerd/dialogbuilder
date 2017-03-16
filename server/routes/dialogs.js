var utils = require(global.appRoot + "/server/utils/utils.js");
var express = require('express');
var mongo = require('mongodb');
var router = express.Router();
  
var MONGO_URI = 'mongodb://admin:Holylaw1@ds017886.mlab.com:17886/dialogdb';

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.post('/submit', function(req,res){
  var entryName = req.body.name;
  var entryDialog = req.body.dialogs;
  if(verifyDialog(entryDialog, res) && verifyName(entryName, res)){
      var submission = {name:entryName, dialog:entryDialog}
      submitEntry(submission, res);
  }
});

router.get('/format', function(req,res){
  if(req.query.dialogs!=undefined){
    var dialogs = JSON.parse(req.query.dialogs).dialogs
    var formatted = formatDialog(dialogs);
    if(verifyDialog(dialogs, res)){
      res.json(formatDialog(dialogs));
    }
  } else {
    res.status(404);
    res.end();
  }
});

router.get('/retrieve', function(req,res){
  if(req.query.query!=undefined){
    getDialogByQuery(JSON.parse(req.query.query), res);
  }
  else if(req.query.name!=undefined){
    getDialogByName(req.query.name, res);
  }
});
    
function getDialogByQuery(query, res){
  getDialog(query, function(err, data){
      if(data){
        res.send(data);
      } else {
        res.status(404).send(err);
      }
  });
}
    
function getDialogByName(name, res){
  getDialog({name:name}, function(err, data){
      if(data){
        res.send(data);
      } else {
        res.status(404).send(err);
      }
  });
}

function getDialog(query, callback){
  var error;
  mongo.connect(MONGO_URI, function(err, db){
    if(!err){
      var collection = db.collection('dialogs');
      collection.find(query).toArray(function(err, data){
          if(!err){
            callback(undefined, data);
          } else {
            callback(err, undefined);
          }
        });
    } else {
      callback("Could not connect to database.", undefined);
    }
  });
}
    
function submitEntry(entry, res){
  var error;
  mongo.connect(MONGO_URI, function(err, db){
    if(!err){
      var collection = db.collection('dialogs');
      collection.insert(entry, function(err, data){
        if(!err){
          console.log("Successful");
          res.send({res:true, message:"Submission Successful"});
        } else {
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

function verifyDialog(dialogs, res){
  if(!dialogs){
    res.status(400).send("Submission was empty");
      return false;
    }
  for(var index = 0; index < dialogs.length; index++){
    var entry = dialogs[index];
    var i = 0;
    for(var name in entry) {
       if(entry[name]==undefined){
         res.status(400).send("Property "  + name + " in Dialog " + index + " was empty.");
         return false;
       }
        if(entry.choices!=undefined){
             for(var j = 0; j < entry.choices.length; j++){
             for(var prop in entry.choices[j]){
                if(entry.choices[j][prop]=="" || entry.choices[j][prop]==undefined){
                  res.status(400).send(prop + " in Choice "  + j + " in Dialog " + index + " was empty.");
                  return false;
                }
             }
             if(dialogs[entry.choices[j].nextDialog]==undefined){
               res.status(400).send("nextDialog in Choice "  + j + " in Dialog " + index + " is not valid.");
               return false;
             }
           }
          
        } else {
          entry.choices=[];
        }
       i++;
    }
  }
  return true;
}

function verifyName(name, res){
  if(!name){
    res.status(400).send("Name cannot be empty or null");
    return false;
  }
  return true;
}

function formatDialog(dialog){
  var result = {};
  var marked = new Array(dialog.length);
  var copy = JSON.parse(JSON.stringify(dialog));
  for(var i = 0; i < copy.length; i++){
    if(!copy[i].hasOwnProperty('id')){
      copy[i].id =i;
    }
    if(!copy[i].hasOwnProperty('choices')){
      copy[i].choices = [];
    }
    copy[i].dialogText = copy[i].dialogText.replace(/\n/g, '$');
  }
  return copy;
}

module.exports=router;