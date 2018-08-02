const express = require('express');
const router = express.Router();

// home screen
router.get('/',(req, res,next) => {
      res.send('Welcome to the education to check the list of students and do some crud operation go to http://localhost:4000/api/students');
});

module.exports = router;
