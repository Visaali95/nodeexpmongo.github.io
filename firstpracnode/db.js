var mclient = require('mongodb').MongoClient({ useNewUrlParser: false });
var dburl = 'mongodb://localhost:27017/mydb';

module.exports.connect = function connect(callback) {
    mclient.connect(dburl, function(err, conn){
        /* exports the connection */
        console.log(conn)
        //module.exports.db = conn;
        if(err){
        callback(err);
      }else{
      callback(conn)
      }

    });
};
