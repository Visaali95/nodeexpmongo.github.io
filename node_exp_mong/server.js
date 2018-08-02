const mongoose = require('mongoose');
const express = require('express');
const fileupload = require('./routes/fileupload');
const customers = require('./routes/customers');
const home = require('./routes/home');
const app = express();

const url = "mongodb://localhost:27017/product";
mongoose.connect(url, function(err) {
  if (err)
    throw err;
  console.log('Successfully connected');
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/fileupload',fileupload);
app.use('/api/customers',customers);
app.use('/',home);
// app.use('/api/customers/aggregate',aggregate);

app.listen(3000, function() {
  console.log('db connectivity check on port 4000!')
});
