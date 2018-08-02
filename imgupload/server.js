const mongoose = require('mongoose');
const express = require('express');
const fileupload = require('./routes/fileupload');
const students = require('./routes/students');
const home = require('./routes/home');
const app = express();

const url = "mongodb://localhost:27017/education";
mongoose.connect(url ,{ useNewUrlParser: true }, function(err) {
  if (err)
    throw err;
  console.log('Successfully connected');
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/fileupload',fileupload);
app.use('/api/students',students);
app.use('/',home);

app.listen(4000, function() {
  console.log('db connectivity check on port 4000!')
});
