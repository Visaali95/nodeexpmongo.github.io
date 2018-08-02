var mysql = require('mysql');

exports.con = mysql.createConnection({
	host : 'fatsorrow.cpwunncqbsxm.ap-south-1.rds.amazonaws.com',
	user : 'admin',
	password :'admin1234',
	database : 'fatsorrow'
});

console.log('connection created');


