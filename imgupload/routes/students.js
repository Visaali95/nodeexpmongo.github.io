const express = require('express');
const router = express.Router();
const Student = require('../model/studentmodel');
const mongoose = require('mongoose');


// create the details
router.post('/', (req, res, next) => {
  let students = [
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      studious: req.body.studious
    }
  ];

  Student.collection.insert(students, function(err, docs) {
    if (err) {
      return console.error(err);
    } else {
      console.log("documents inserted to Collection");
      console.log(students);
      res.send(students);
    }
  });
});

// read details
router.get('/', (req, res, next) => {
  Student.collection.find({}).toArray((err, result) => {
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

  Student.collection.updateMany(myquery,newvalues,(err, result) => {
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
	Student.collection.deleteMany(({ regularCust : req.body.regularCust }), (err,result) => {
		if (err) {
			return console.error(err);
		} else {
			console.log('documents deleted',result);
			res.send(result);
		}
	})
});



module.exports = router;
