var utils = require(global.appRoot + "/server/utils/utils.js");
var express = require('express');
var mongo = require('mongodb');
var router = express.Router();
  
var MONGO_URI = process.env.MONGO_URI;

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.post('/', function(req,res){
  var entryName = req.body.name;
  var entryDialog = req.body.dialogs;
  if(verifyDialog(entryDialog, res) && verifyName(entryName, res)){
      var submission = {name:entryName, dialog:entryDialog}
      submitEntry(submission, res);
  }
});

router.delete('/', function(req,res){
  var name = req.body.name;
  if(name){
    mongo.connect(MONGO_URI, function(err, db){
      if(!err){
        var collection = db.collection('dialogs');
        collection.remove({name:name});
        res.status(202).end();
      } else {
        res.status(500).send("Could not connect to database.");
      }
    });
    
  } else {
    res.status(400).end();
  }
});

router.get('/format', function(req,res){
  if(req.query.dialogs!=undefined){
    var delimiter = req.query.delimiter != undefined && req.query.delimiter.length == 1 ? req.query.delimiter : undefined
    var dialogs = JSON.parse(req.query.dialogs).dialogs
    //var formatted = formatDialog(dialogs, delimiter);
    if(verifyDialog(dialogs, res)){
      res.status(200).send(formatDialog(dialogs, delimiter));
    }
  } else {
    res.status(400);
    res.end();
  }
});

router.get('/', function(req,res){
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
        res.status(400).send(err);
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
  mongo.connect(MONGO_URI, function(err, db){
    if(!err){
      var collection = db.collection('dialogs');
      collection.insert(entry, function(err, data){
        if(!err){
          res.status(201).send({message:"Submission Successful"});//.send({res:true, message:"Submission Successful"});
        } else {
          res.status(500).send("Failed to insert new entry into database - " + err);
        }
      });
      db.close();
    } else {
      console.log("error connecting." + err);
      res.status(500).send("Could not connect to database.");
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
        if(entry.conditions!=undefined){
          for(j = 0; j < entry.conditions.length; j++){
            for(prop in entry.conditions[j]){
              if(entry.conditions[j].prop == "" || entry.conditions[j][prop]==undefined){
                res.status(400).send(prop + " in Condition " + j + " in Dialog " + index + " was empty");
                return false;
              }
            }
            if(dialogs[entry.conditions[j].failDialog]==undefined){
              res.status(400).send("failDialog in Condition "  + j + " in Dialog " + index + " is not valid.");
               return false;
            }
          }
        } else {
          entry.conditions = [];
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

function formatDialog(dialog, delimiter){
  
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
    if(!copy[i].hasOwnProperty('conditions')){
      copy[i].conditions = [];
    }
    if(delimiter!=undefined){
      copy[i].dialogText = copy[i].dialogText.replace(/\n|\/n/g, delimiter);
    }

  }
  return copy;
}

module.exports=router;