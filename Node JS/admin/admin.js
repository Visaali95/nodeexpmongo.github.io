var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var db = require('../db')
var crypto = require('crypto');
var multer = require('multer');
var fs = require('fs')
var dateFormat = require('dateformat');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*****************************************************************
*********************ADD MAIN CATEGORY **************************
****************************************************************/

var storage = multer.diskStorage({
  destination: '././admin/uploads/category_icon/',
  filename: function(req,file,cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
}); 

var upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('image');


function checkFileType(file, cb){
  var filetypes = /jpeg|jpg|png|gif/;
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  var mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    //cb('Error: Images Only!');
    console.log('images Only');
  }
}

router.post('/addmaincategory',function(req,res){ 
  upload(req,res,function(err){
    if (err) {
     res.send(err)
   }else{
    var selectQ = 'select category from main_category where category=(?)';
    db.con.query(selectQ,[req.body.categroryName],function(err,result){
     if(result.length) {
      res.send("category already exist");
    }else{
      var insertQ = 'insert into main_category (category,img_path) values (?,?)';
      db.con.query(insertQ,[req.body.categroryName,req.file.filename],function(err,result){
       if(err){
         res.send(err)
       }else{
        res.send('category added');
      }
    })
    }
  })
  }
})
})


/*****************************************************************
*************************ADMIN LOGIN**************************
****************************************************************/
router.post('/adminlogin',function(req,res){  

  try{
    req.body = JSON.parse(Object.keys(req.body)[0]) 
  }
  catch(err){
    req.body = req.body
  }   
  var selectQ = 'select * from admin where username=(?) and password=(?)'; 
  var encryptpassword = crypto.createHash('md5').update(req.body.password).digest('hex');
  db.con.query(selectQ,[req.body.username,encryptpassword],function(err,result){
    if (!result.length) {
      res.send("wrong username or password");
    }else{
      res.send("login successfully"); 
    }
  }) 
})

/*****************************************************************
**************ADD SUB CATEGORY**************************
****************************************************************/
router.post('/addsubcategory',function(req,res){
  try{
    req.body = JSON.parse(Object.keys(req.body)[0]) 
  }
  catch(err){
    req.body = req.body
  }
  var insertQ = 'insert into sub_category (maincategory_id,subcategory) values (?,?)';
  db.con.query(insertQ,[req.body.id,req.body.scategory],function(err,result){
    if (err) {
      res.send(err);
    }else{
      res.send(result);
    }
  })  
})  

/*****************************************************************
**************EDIT MAIN CATEGORY**************************
****************************************************************/

router.post('/editmaincategory',function(req,res){ 
  upload(req,res,function(err){
    console.log(req.body)
    console.log(req.file)
    if(req.file === undefined){
      var updateQ = 'update main_category set category=(?) where id=(?)';
      db.con.query(updateQ,[req.body.categoryName,req.body.id],function(err,result){
       if(err){
         res.send(err)
       }else{
         res.send("category name updated ");
       }
     }) 
    }else{
      if (err){
       res.send(err)
     }else{
      var selectQ = 'select category,img_path from main_category where id=(?)';
      db.con.query(selectQ,[req.body.id],function(err,result){
        result.forEach(function(rows){
          // if (rows.category === req.body.categoryName){
          //   res.send ('duplicate category name')
          // }else{  
            var old_image = rows.img_path; 
            fs.unlink(path.join("admin/uploads/category_icon/",old_image), function (err) {
              if (err) throw err;
              console.log('File deleted!');
            });	
            var updateQ = 'update main_category set category=(?), img_path=(?) where id=(?)';     
            db.con.query(updateQ,[req.body.categoryName,req.file.filename,req.body.id],function(err,result){
             if(err){
               res.send(err)
             }else{
               res.send("image uploaded");            }
             })
          // }
        })
      })
    }
  }
})
})

/*****************************************************************
**************EDIT SUB CATEGORY**************************
*************************************************************db.***/

router.post('/editsubcategory',function(req,res){
  console.log(req.body)
  try{
    req.body = JSON.parse(Object.keys(req.body)[0]) 
  }
  catch(err){
    req.body = req.body
  }
  console.log(req.body)
  db.con.query("update sub_category set subcategory=(?) where id=(?)", [req.body.scategory,req.body.sub_id],function(err,result){
    if (err) {
      res.send(err);
    }else{
      res.send(result);
    }
  })
})

/*****************************************************************
**************GET MAIN AND SUB CATEGORY**************************
*************************************************************db.***/


router.get('/getcategory',function(req,res){ 
  db.con.query("select m.id main_id, m.category maincat, concat('http://13.232.187.121:4000/category_icon/', m.img_path) img, s.id sub_id, s.subcategory from main_category m left join sub_category s on s.maincategory_id=m.id ", function (err, result) {
    if (err) throw err;
    var categoryMap = {};
    var categories = [];  
    result.map((res) => { 
      var category = categoryMap[res.main_id]; 
      if(!category){  
        category = {
         cat_id: res.main_id,
         cat_icon: res.img,
         cat_name: res.maincat,
         subCategory: []
       };  
       categoryMap[res.main_id] = category;
       categories.push(category);
     } 
     category.subCategory.push({
       subid: res.sub_id,
       subcat: res.subcategory
     }); 
   }) 
    res.send(categories)
  })
})

/*****************************************************************
**************user list**************************
****************************************************************/

router.get('/userlist',function(req,res,next){
  var selectQ = 'select username from registration';
  db.con.query(selectQ,function(err,result){
   if (err) {console.log(err)};
   res.send(result);
 })
})

router.get('/getpendingstory',function(req,res){
  db.con.query('select id,user_email, date_format(created_date, "%D %M %Y") created_date,status from story where status =0',function(err,result){
    if (err) {
      res.send(err)
    }else{

      res.send(result)
    }
  })
})

router.get('/getactivestory',function(req,res){
  db.con.query('select id,user_email, date_format(created_date, "%D %M %Y") created_date,status from story where status =1',function(err,result){
    if (err) {
      res.send(err)
    }else{

      res.send(result)
    }
  })
})

router.get('/getrejectedstory',function(req,res){
  db.con.query('select id,user_email, date_format(created_date, "%D %M %Y") created_date,status from story where status =-1',function(err,result){
    if (err) {
      res.send(err)
    }else{

      res.send(result)
    }
  })
})



router.post('/viewpost',function(req,res){
//  console.log(req.body)
  try{
    req.body = JSON.parse(Object.keys(req.body)[0]) 
  }
  catch(err){
    req.body = req.body
  }
  var selectQ = 'select  description, user_email,date_format(created_date, "%D %M %Y") create_dated, category, subcategory from story, main_category, sub_category where story.id=(?) and main_category.id=(select maincategory_id from story where id=(?)) and sub_category.id=(select subcategory_id from story where id=(?))';
  db.con.query(selectQ,[req.body.id,req.body.id,req.body.id], function(err,result){
    if (err) {
      res.send(err)
    }else{
      res.send(result)
    }
  })

})


router.post('/actionOnPendingStory',function(req,res){
  try{
    req.body = JSON.parse(Object.keys(req.body)[0]) 
  }
  catch(err){
    req.body = req.body
  }
  console.log(req.body)
  var updateQ = 'update story set status=(?) where id=(?)'; 
  db.con.query(updateQ,[req.body.status,req.body.id],function(err,result){
    if (err) {
      res.send(err)
    }else if (req.body.status===1 ) {
      res.send('story approved');
    }else if(req.body.status ===-1){
      res.send('story rejected')
    }
  })

})

module.exports= router;