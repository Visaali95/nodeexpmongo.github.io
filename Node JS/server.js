
	var express = require('express');
	var bodyParser = require('body-parser');
	var path = require('path');
	var app = express();
	var crypto = require('crypto');
	var admin = require('./admin/admin');
	var user = require('./user/user')
	var db = require('./db');
	
	app.use(bodyParser.json()); 
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json({ type: 'application/*+json' }));
	app.use(express.static(path.join(__dirname, "/admin/uploads/")));
	app.use(express.static(path.join(__dirname, "/user/")));

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});


	app.get('/',function(req,res,next){
 		res.send('this is test')
	app.use('/user', user);	

	app.listen(4000,function(){
		
	})


 	})

	app.use('/admin', admin);