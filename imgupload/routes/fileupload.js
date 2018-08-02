const express = require('express');
const router = express.Router();
const multer = require('multer');
const Fileupload = require('../model/fileuploadmodel');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let storage = multer.diskStorage({
  destination: 'public/images/uploads',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

function checkFileType(file, cb) {
  var filetypes = /jpeg|jpg|png|gif/;
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  var mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    //cb('Error: Images Only!');
    console.log('images Only');
  }
}

// image upload

router.post('/', (req, res, next) => {

  upload(req, res, function(err) {
    if (err) {
      res.send(err)
    } else {

      let files = {
        img: req.file.filename,
        imgPath: req.file.path
      };
      Fileupload.collection.insertOne(files, function(err, result) {
        // console.log(req.file);
        // {
        //   fieldname : 'image',
        //   originalname: 'Screenshot from 2018-08-01 10-24-53.png',
        //   encoding: '7bit',
        //   mimetype: 'image/png',
        //   destination: 'public/images/uploads',
        //   filename: 'image-1533185624618.png',
        //   path: 'public/images/uploads/image-1533185624618.png',
        //   size: 180225
        // }

        if (err) {
          res.send(err)
        } else {
          res.send("image uploaded succesfully");

        }
      })
    }
  })
});

// img update
router.post('/:_id', (req, res, next) => {
  upload(req, res, function(err) {
    //console.log(req.file)
    // console.log(req.params)
    // { _id: '5b628f004f212f2fa0f5a784' }

    if (err) {
      res.send(err);
    } else {

      Fileupload.collection.find({}).forEach(function(rows) {
        let files = {
          _id:req.params._id
        }
          //var old_image = rows.files;
          	fs.unlink(path.join("admin/uploads/category_icon/",old_image), 			function (err) {
              if (err) throw err;
              console.log('File deleted!');
            });
          var myquery = {_id:req.params._id};
          var newvalues = {
            $set: {"img": req.file.filename,"imgPath": req.file.path}
          }

          Fileupload.collection.updateMany(myquery,newvalues, (err, result) => {
            if (err) {
              res.send(err);
            } else {
              console.log('image updated');
               res.send("image updated")
            }
          })
        })
    }
  })
})
    module.exports = router;
