var express = require('express');
var app = express ();

app.use('/img', express.static(process.cwd() + '/img'))
app.use(express.static('static'));
app.listen(8080);
