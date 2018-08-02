var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('../db')
var datetime = require('node-datetime');
var crypto = require('crypto');
var multer = require('multer');
var path = require('path');
var fs = require('fs')

router.use(bodyParser.json()); 
router.use(bodyParser.urlencoded({ extended: true }));

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var currdatetime = new Date();

var storage = multer.diskStorage({
  destination: '././user/profile_image/',
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



/*****************************************************************
*************************REGISTRATION**************************
****************************************************************/	

router.post('/registration',function(req,res){
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}
	var selectQ = 'select email,login_mode from registration where email= ?';
	db.con.query(selectQ,[req.body.email],function(err,result){
		if (result.length) {
			result.forEach(function(rows){
				if (rows.login_mode==='facebook') {
					res.send('please try with facebook login @ email already used with facebook login')
				}else{
					res.send('Duplicate')		
				}
			})
		}else{
			var insertQ = 'insert into registration (login_mode,email,password,access_token,created_datetime) values (?,?,md5(?),?,?)';
			db.con.query(insertQ,['website',req.body.email,req.body.password,'-------',currdatetime],function(err,result){
				if (err) 
					{console.log(err)
					}else{
						res.send('successfully');
					}
				})
		}
	})
})

/*****************************************************************
*************************FACEBOOK LOGIN**************************
****************************************************************/

router.post('/facebooklogin',function(req,res){
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}
	var selectQ = 'select login_mode,email from registration where email=(?)';
	db.con.query(selectQ,[req.body.email],function(err,result){
		if(!result.length){
			var insertQ = 'insert into registration (login_mode,username,email,password,access_token,profile_image,created_datetime) values (?,?,?,?,?,?,?)';
			db.con.query(insertQ,['facebook',req.body.username,req.body.email,'-----',req.body.access_token,req.body.profile_image,currdatetime],function(err,result){
				if (err) {
					res.send(err)
				}else{
					res.send('inserted')
				}
			})
		}else{
			result.forEach(function(rows){
				if (rows.login_mode==='facebook') {
					var updateQ = 'update registration set last_login=(?),username=(?) where email=(?)';
					db.con.query(updateQ,[currdatetime,req.body.username,req.body.email],function(err,result){
						if (err) {
							res.send(err)
						}else{
							res.send('logged in')
						}
					})
				}else{
					res.send('email already regitered with website')
				}
			})
		}
	})
})



/*****************************************************************
*************************USER LOGIN**************************
****************************************************************/

router.post('/userlogin',function(req,res){  
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}   
	var selectQ = 'select email from registration where email=(?)';
	db.con.query(selectQ,[req.body.email],function(err,result){
		if (!result.length) {
			res.send("invalid email");
		}else{
			var selectQ = 'select password from registration where password=(?)';
			var encryptpassword = crypto.createHash('md5').update(req.body.password).digest('hex');
			db.con.query(selectQ,[encryptpassword],function(err,result){
				if (!result.length) {
					res.send("wrong password");
				}else{
					var updateQ = 'update registration set last_login=(?) where email=(?)';
					db.con.query(updateQ,[currdatetime,req.body.email],function(err,result){
						res.send("login successfully");	
					})

				}
			})		
		}
	}) 
})

/*****************************************************************
*************************UPDATE USER PROFILE**************************
****************************************************************/

router.post('/updateUserProfile',function(req,res){
	upload(req,res,function(err){
    if(req.file === undefined){
      var updateQ = 'update registration set username=(?), mobile_number=(?),gender=(?),age=(?),city=(?),country=(?),last_login=(?) where email=(?)';
      db.con.query(updateQ,[req.body.username,req.body.mobile,req.body.gender,req.body.age,req.body.city,req.body.country,currdatetime, req.body.email],function(err,result){
       if(err){
         res.send(err)
       }else{
         res.send("profile updated ");
       }
     }) 
    }else{
      if (err){
       res.send(err)
     }else{
      var selectQ = 'select profile_image from registration where email=(?)';
      db.con.query(selectQ,[req.body.email],function(err,result){
        result.forEach(function(rows){
            var old_image = rows.profile_image; 
            fs.unlink(path.join("user/profile_image/",old_image), function (err) {
              if (err) throw err;
              console.log('File deleted!');
            });	
            var updateQ = 'update registration set username=(?), mobile_number=(?),gender=(?),age=(?),city=(?),country=(?),profile_image=(?),last_login=(?) where email=(?)';     
            db.con.query(updateQ,[req.body.username,req.body.mobile,req.body.gender,req.body.age,req.body.city,req.body.country,req.file.filename,currdatetime, req.body.email],function(err,result){
             if(err){
               res.send(err)
             }else{
               res.send("profile updated");            }
             })
        })
      })
    }
  }
})
})


/*****************************************************************
*************************GET USER PROFILE**************************
****************************************************************/

router.post('/userprofile',function(req,res){
	var selectQ = 'select username,gender,age,mobile_number,gender,age,city,country,concat("http://13.232.187.121:4000/profile_image/",profile_image) image from registration where email=(?)';
	db.con.query(selectQ,[req.body.email],function(err,result){
		if (err){ 
			res.send(err)
		}else{
			res.send(result)
		}
	})
})



router.get('/selectcategory',function(req,res){

	var selectQ = "select id, category from main_category";
	db.con.query(selectQ,function(err,result){
		if (err) {
			res.send(err)
		}else{
			res.send(result);
		}	
	})

})

router.post('/selectsubcategory',function(req,res){
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}
	var selectQ = "select id, subcategory from sub_category where maincategory_id=(?)";
	db.con.query(selectQ,[req.body.cat_id],function(err,result){
		if (err) {
			res.send(err)
		}else{
			res.send(result);
		}	
	})

})


/*****************************************************************
*************************post story**************************
****************************************************************/

router.post('/postStory',function(req,res){
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}   
	var currdatetime = new Date();
	console.log(currdatetime)
	var insertQ = 'insert into story (user_email, maincategory_id, subcategory_id, description, created_date,status) values (?,?,?,?,?,?)';
	db.con.query(insertQ,[req.body.email, req.body.category_id,req.body.subcat_id, req.body.story, currdatetime,req.body.status],function(err,result){
		if (err) {
			res.send(err)
		}else{
			res.send('post successfully!!!')
		}
	})
})

/*****************************************************************
*************************post story**************************
****************************************************************/

router.get('/getcategory',function(req,res){
	var selectQ = 'select m.id main_id, m.category maincat, concat("http://13.232.187.121:4000/category_icon/", m.img_path) img, sum(CASE WHEN s.status=1 THEN 1 ELSE 0 END) story_id from main_category m left join story s on m.id=s.maincategory_id group by main_id ' ;
	db.con.query(selectQ,function(err,result){
		if (err) {
			res.send(err)
		}else{
			res.send(result)
		}
	})
})

router.post('/viewstory',function(req,res){
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}
	var selectQ = 'select category, description , user_email, date_format(created_date, "%D %M %Y") create_dated from story, main_category where story.maincategory_id=(?) and main_category.id=(?) and sub_category.maincategory_id=(?)'
	db.con.query(selectQ,[req.body.id,req.body.id,req.body.id], function(err,result){
		if (err) {
			res.send(err)
		}else{
			res.send(result)
		}
	})

})

router.post('/search',function(req,res){
	try{
		req.body = JSON.parse(Object.keys(req.body)[0]) 
	}
	catch(err){
		req.body = req.body
	}
	var words = req.body.word
		//var selectQ = 'select description, user_email from story where maincategory_id=(select id from main_category where category like "'+words+'%") or subcategory_id=(select id from sub_category where subcategory like "'+words+'%") ';
		var selectQ = 'select category,subcategory, description, created_date from main_category,sub_category,story where description like "'+words+'%"';
		db.con.query(selectQ, function(err,result){
			if (err) {
				res.send(err)
			}else if(!result.length){
				res.send("no record")
			}else{
				res.send(result)
			}


		})

	})

router.get('/recentpost',function(req,res){
	var selectQ = 'select category,subcategory,description, created_date, user_email from main_category,sub_category, story group by description limit=6';
	db.con.query(selectQ,function(err,result){
		if (err){ 
			res.send(err)
		}else{
			res.send(result)
		}
	})
})


module.exports = router;