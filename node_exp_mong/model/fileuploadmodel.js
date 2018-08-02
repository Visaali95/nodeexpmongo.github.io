const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  img:String,
  description: String
});

var Fileupload = mongoose.model('Fileupload', imageSchema);

module.exports = Fileupload;
