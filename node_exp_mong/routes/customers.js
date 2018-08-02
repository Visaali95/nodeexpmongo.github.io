const express = require('express');
const router = express.Router();
const Customer = require('../model/customermodel');
const mongoose = require('mongoose');


// create the details
router.post('/', (req, res, next) => {
  let customers = [
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      regularCust: req.body.regularCust
    }
  ];

  Customer.collection.insert(customers, function(err, docs) {
    if (err) {
      return console.error(err);
    } else {
      console.log("documents inserted to Collection");
      console.log(customers);
      res.send(customers);
    }
  });
});

// read details
router.get('/', (req, res, next) => {
  Customer.collection.find({}).toArray((err, result) => {
    if (err) {
      return console.error(err);
    } else {
      res.send(result);
    }
  });
});

// update details
router.put('/', (req, res, next) => {

	var myquery = {"regularCust":req.body.regularCust};
	console.log(myquery);
	var newvalues = {$set: {"phone":req.body.phone,"email":req.body.email}};

  Customer.collection.updateMany(myquery,newvalues,(err, result) => {
		if (err) {
			return console.error(err);
		} else {
			console.log('documents updated',result);
			res.send(result);
		}
  });
});

// delete details
router.delete('/',(req,res,next) => {
	Customer.collection.deleteMany(({ regularCust : req.body.regularCust }), (err,result) => {
		if (err) {
			return console.error(err);
		} else {
			console.log('documents deleted',result);
			res.send(result);
		}
	})
});



module.exports = router;
