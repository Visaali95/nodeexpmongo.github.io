const express = require('express');
const router = express.Router();
const multer = require('multer');
const Fileupload = require('../model/fileuploadmodel');
const mongoose = require('mongoose');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //console.log(file);
  //   { fieldname: 'image',
  // originalname: 'business-people-handshake-greeting-deal-at-work_1150-645.jpg',
  // encoding: '7bit',
  // mimetype: 'image/jpeg' }
    cb(null, 'public/images/uploads');
   },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.fieldname)
  }

});

let upload = multer({storage: storage});

router.post('/', upload.single('image'), (req, res, next) => {

  console.log("FILENAME: " + req.file.filename);

  var Fileuploadv = new Fileupload({
    img: req.file.filename
  });
  Fileuploadv.save((err, resu) => {
    if (err) {
      console.log(err)
    } else {
      Fileupload.find({}).exec((err, resu) => {
        if (err) {
          console.log(err)
        } else {
          console.log(resu)
          res.json({"RESUKT": resu})
        }
      });
    }
  });

});

module.exports = router;
