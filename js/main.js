let express = require('express'),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    path = require('path');
const req = require('express/lib/request');
    session = require('express-session');
    app = express();
    bodyParser = require("body-parser");
    https = require('https');
    fs = require('fs');

app.engine('html', engines.hogan);
app.set('view engine','html');
app.use('/css',express.static(path.resolve(__dirname,"../static/css")));
app.use('/img',express.static(path.resolve(__dirname,"../static/img")));


/*---------- SESSION + COOKIES INIT ----------*/

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(session({
  secret: "propre123",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    path: '/', 
    httpOnly: true, 
    maxAge: 3600000
  }
}));

   /*---------- DB INIT ----------*/
MongoClient.connect('mongodb://localhost:27017', (err, db) => {
   const dba = db.db("sc").collection('accounts');
   const dbo = db.db("data_torpille").collection('index');
   if (err) throw err;

      /*---------- HOME (ROOT_PAGE) ----------*/

   app.get('/',function(req,res){
      res.render("home.html");
   });
   app.get('/home.html',function(req,res){
      res.render("home.html");
   });


      /*---------- LOGIN ----------*/

   app.get('/login.html',function(req,res){
      res.render("login.html");
   });
   app.post('/log',function(req,res, next){
      dba.findOne({"username":req.body.username}, (err,doc)=>{
         try{
            if (req.body.password == doc["password"] ) {
               req.session.username = req.body.username;
               res.redirect('home.html');
            };
            res.render('login.html',{message : "wrong password"});
         }catch{
            res.render('login.html',{message : "user don't exist"});
         }
      });
   });


      /*---------- REGISTER ----------*/

   app.get('/register.html',function(req,res){
      res.render("register.html");
   });
   app.post('/reg',function(req,res,next){
      dba.findOne({"username":req.body.reg_name}, (err,doc)=>{
         try{
            if (req.body.reg_password == doc["password"] ) {
               res.render('login.html',{message : "Account already exist, please login"});
            };
            res.render('login.html',{message : "Account already exist, but wrong password"});
         }catch{
            dba.insertOne({"username":req.body.reg_name,"password":req.body.reg_password});
            res.render('login.html',{message : "Account successfully created, please login"});
         };
      });
   });

      /*---------- SHOW ALL TORPILLE DATABASE ----------*/

   app.get('/index.html', (req, res) => {
      if(req.session.username){
         dbo.find({}).toArray(function(err,doc) {
            res.render('index.html', { "repo":doc } );
         });
      }else{
         res.redirect("/login.html");
      };      
   });


/*---------- ADD TORPILLE TO DATABASE ----------*/

   app.get('/new.html',(req,res) =>{
      if(req.session.username){
         dbo.estimatedDocumentCount().then(function(size){
            dbo.find().skip(size-1).toArray(function(err,doc){
               res.render('new.html',doc[0]);    
            });
         });
      }else{
         res.redirect("/login.html");
      };
   });
   app.get('/send', function(req,res) {
      if (req.query.InputBoxEmetteur=="" ||req.query.InputBoxRecepteur=="" || req.query.InputDate=="" ){
         res.render('new.html', {succes : "Erreur : Remplissez tous les données correctement"} );
      };
      dbo.estimatedDocumentCount().then(function(size){
         dbo.insertOne({ "date" : req.query.InputDate, "Envoyeur" : req.query.InputBoxEmetteur, "Receveur" : req.query.InputBoxRecepteur, "commentaire" : size+1 });
      });
      res.render('new.html', {succes : "successfully send"} );
   });


      /*---------- ERROR 404 (DEFAULT_PAGE) ----------*/

   app.get('*', (req, res) => {
      res.status(404).send('Page Not Found voila');
   }); 
});


https.createServer(
   {
   key: fs.readFileSync('./key.pem'),
   cert: fs.readFileSync('./cert.pem'),
   passphrase: 'ingi'
 }, app).listen(8080);
console.log('Express server started on port 8080');


