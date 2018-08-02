const express = require('express');
const bodyParser = require ('body-parser');
//var mongo = require('./db.js');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/user',function(req,res,next){

//  res.send('sdfsdfsdf')
  MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("user").find({}).toArray(function(err, result) {
      if (err) throw err;
      res.send({result : result});
      db.close();
    });
  })
});

app.post('/user',function(req,res,next){
  var item = {
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone,
    address:req.body.address
  }

  MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("user").insertOne(item, function(err, response) {
      if (err) throw err;
      res.send('records inserted');
      console.log('records inserted')
      db.close();
    });
  })
});

app.put('/user',function(req,res,next){
  MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myquery = {name:'vivek'}
    //console.log(myquery)
    var newvalues = { $set: {email: req.body.email, phone:req.body.phone } };
    dbo.collection("user").updateOne(myquery,newvalues,function(err, response) {
    if (err) throw err;
    res.send('document updated')
    //console.log(" document updated");
    db.close();
    });
  })
});

app.delete('/user',function(req,res,next){
  MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myquery =  { name: req.body.name }
    dbo.collection("user").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    res.send('document deleted')
  //  console.log(" document deleted");
    db.close();
    });
  })
});
	app.listen(4000,function(){
    console.log('db connectivity check on port 4000!')
	});
