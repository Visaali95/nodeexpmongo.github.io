const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/*+json' }));


app.get('/',(req,res) => {
  res.send('Hello World!')
});


app.post('/test', (req,res) => {
res.send(req.body.name)
});


app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});
