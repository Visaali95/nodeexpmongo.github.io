const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
  custId: ObjectId,
  name: String,
  age: Number,
  gender: String,
  phone: Number,
  email: String,
  regularCust: Boolean,
});

const Customer = mongoose.model('Customer', productSchema);

module.exports = Customer;
