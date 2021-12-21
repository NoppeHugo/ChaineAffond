let express = require('express'),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    path = require('path');

let app = express();
app.engine('html', engines.hogan);
app.set('view engine','html');
app.use('/css',express.static(path.resolve(__dirname,"../static/css")));
app.use('/img',express.static(path.resolve(__dirname,"../static/img")));

const mongoose    =require('mongoose')
const morgan      =require('morgan')
const bodyParser  =require('body-parser')

 MongoClient.connect('mongodb://localhost:27017', (err, db) => {
	dbo = db.db("data_torpille");
    if (err) throw err;
    app.get('/index.html', (req, res) => {
        dbo.collection('index').find({}).toArray(function(err,doc) {
         if (err) throw err;
        res.render('index.html',
        {
           "repo":doc
        }
        );
      });      
    });
    app.get('/',function(req,res){
        res.render("home.html");
     });
     app.get('/home.html',function(req,res){
        res.render("home.html");
     });
     app.get('/new.html',function(req,res){
        res.render("new.html");
     });
     app.get('/login.html',function(req,res){
        res.render("login.html");
     });
     app.get('/register.html',function(req,res){
        res.render("register.html");
     });
     app.get('*', (req, res) => {
        res.status(404).send('Page Not Found voila');
    });
    app.listen(8080);
    console.log('Express server started on port 8080');
});

