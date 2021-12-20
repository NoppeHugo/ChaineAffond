var express = require('express');
var consolidate = require('consolidate');
var app = express();

app.engine ( 'html', consolidate.hogan )
app.set('views', 'private');

app.get('/', function(req, res){
    res.render("../static/home.html");
});
app.use(express.static('static'));
app.listen(8080);