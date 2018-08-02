const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const studentSchema = new Schema({
  custId: ObjectId,
  name: String,
  age: Number,
  gender: String,
  phone: Number,
  email: String,
  studious: Boolean,
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
