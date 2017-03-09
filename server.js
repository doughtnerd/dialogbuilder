var express = require("express");
var mongodb = require('mongodb');
var parser = require("body-parser");
var path = require('path');

var app = express();

global.appRoot = path.resolve(__dirname);

var dialogs = require("./server/routes/dialogs.js");

var mongo = mongodb.MongoClient;

//Set view engine
app.set('view engine', 'pug');
app.set('views', __dirname + '/client/');
app.set('view options', {
    layout: false
});

//Set statically served root.
app.use(express.static(__dirname + "/client"));

app.use(parser.urlencoded({extended : true}));
app.use(parser.json());

app.use('/dialogs', dialogs);

app.get('/', function(req,res){
    res.render('index');
});

//Listen for connections.
app.listen(process.env.PORT || 8080, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});