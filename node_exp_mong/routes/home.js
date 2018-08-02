const express = require('express');
const router = express.Router();

// home screen
router.get('/',(req, res,next) => {
      res.send('Welcome to the Product to check the list of customers and do some crud operation go to http://localhost:3000/api/customers');
});

module.exports = router;
