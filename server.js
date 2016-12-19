const express = require('express');
const fetch = require('isomorphic-fetch');

const app = express();

app.use(function(req, res, next){
  console.log(req.method, req.url, new Date());
  next();
});

app.use(express.static(__dirname));

app.use(function(req,res, next) {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Accept', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    // res.setHeader('Allow', 'GET, POST, PUT, PATCH, HEAD, OPTIONS');
    res.set('Allow', 'GET, OPTIONS');
    return res.send('');
  }

  const url = req.url.slice(1);

  if (!url.match(/^http/)) return res.status(404).send('not found');

  fetch(url)
    .then(resp => resp.json())
    .then(json => res.send(json))
    .catch(err => res.status(500).send(err));

});

app.listen(5000);