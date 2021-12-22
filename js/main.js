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

/*logged funct*/
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
/*public zone*/
app.get('/',function(req,res){
   res.render("home.html");
});
app.get('/home.html',function(req,res){
   res.render("home.html");
});
app.get('/login.html',function(req,res){
   res.render("login.html");
});
MongoClient.connect('mongodb://localhost:27017', (err, db) => {
   const dba = db.db("sc").collection('accounts');
   if (err) throw err;
   app.post('/log',function(req,res, next){
      dba.findOne({username:req.body.username},(err,doc)=>{
         if (err) throw err;
         var a = doc["password"];
         var b = req.body.password;
         console.log(a==b);
         if( a==b ){
            req.session.username = req.body.username;
            console.log("log ok");
            res.render("home.html");
         }; 
      console.log("skip"); 
      });
      res.redirect("register.html");
   });
});
app.get('/register.html',function(req,res){
   res.render("register.html");
});

/*test if acces*/
function is_log(req, res){
   if(!req.session.username){
      res.render("login.html");
   };
};

MongoClient.connect('mongodb://localhost:27017', (err, db) => {
   const dbo = db.db("data_torpille").collection('index');
   if (err) throw err;
   app.get('/index.html', (req, res) => {
      is_log(req,res);
      dbo.find({}).toArray(function(err,doc) {
         if (err) throw err;
      res.render('index.html',
         {
            "repo":doc
         });
      });      
   });
   /*Ajouter/Envoyer une torpille */
   app.get('/new.html',(req,res) =>{
      is_log(req,res);
      dbo.estimatedDocumentCount().then(function(size){
         dbo.find().skip(size-1).toArray(function(err,doc){
            res.render('new.html',doc[0]);    
         });
      });
   });
   app.get('/send', function(req,res) {
      is_log(req,res);
      if (req.query.InputBoxEmetteur=="" ||req.query.InputBoxRecepteur=="" || req.query.InputDate=="" ){
         res.render('new.html', {succes : "Erreur : Remplissez tous les données correctement"} );
      }
      dbo.estimatedDocumentCount().then(function(size){
         dbo.insertOne({ "date" : req.query.InputDate, "Envoyeur" : req.query.InputBoxEmetteur, "Receveur" : req.query.InputBoxRecepteur, "commentaire" : size+1 })
      });
      res.render('new.html', {succes : "successfully send"} );
   });
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


