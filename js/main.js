let express = require('express'),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    path = require('path');
    nodemailer = require('nodemailer');

const { range } = require('express/lib/request');
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
var transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'chaineaffond@gmail.com',
     pass: 'ChaineAffond2-3'
   }
 });

   /*---------- DB INIT ----------*/   
MongoClient.connect('mongodb://localhost:27017/storage', (err, db) => {
      const dba = db.db("sc").collection('accounts');
      const dbb = db.db("data_torpille").collection('index');

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
            console.log(doc);
            if (req.body.password == doc["password"] ) {
               req.session.username = req.body.username;
               var mailOptions = {
                  from: 'chaineaffond@gmail.com',
                  to: doc["email"],
                  subject: '[Torpille-Chaine] Connexion',
                  text: "Vous venez de vous connecter sur notre plateforme. Si c'était bien vous, vous pouvez ignorer cet email."
                };
               transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log("error email");
                  } else {
                    console.log('Email sent: ' + info.response);
                  };
                });
               res.redirect('home.html');
            };
            res.render('login.html',{message : "Mot de passe erroné"});
         }catch{
            res.render('login.html',{message : "L'utilisateur n'existe pas"});
         }
      });
   });


      /*---------- REGISTER ----------*/

   app.get('/register.html',function(req,res){
      res.render("register.html");
   });
   app.post('/reg',function(req,res,next){
      if (req.body.reg_passwor=="" ||req.body.reg_name=="" ||req.body.reg_email==""){
         res.render('register.html', {message : "Erreur : Remplissez tous les données correctement"} );
      };
      dba.findOne({"username":req.body.reg_name}, (err,doc)=>{
         try{
            if (req.body.reg_password == doc["password"] ) {
               res.render('login.html',{message : "Ce compte existe déjà. Connectez-vous !"});
            };
            res.render('login.html',{message : "Ce compte existe, mais ce n'est pas le bon mot de passe"});
         }catch{
            dba.insertOne({"username":req.body.reg_name,"password":req.body.reg_password,"email":req.body.reg_email});
            var mailOptions = {
               from: 'chaineaffond@gmail.com',
               to: req.body.reg_email,
               subject: '[ChaineAffond] Inscription',
               text: 'Vous êtes correctement inscrit sur notre plateforme. Bienvenue à vous!'
             };
             transporter.sendMail(mailOptions, function(error, info){
               if (error) {
                 console.log("error email");
               } else {
                 console.log('Email sent: ' + info.response);
               }
             });
            res.render('login.html',{message : "Vous êtes correctement inscrit. Connectez-vous !"});
         };
      });
   });

      /*---------- SHOW ALL TORPILLE DATABASE ----------*/

   app.get('/index.html', (req, res) => {
      if(req.session.username){
         try{
            dbb.find({}).toArray(function(err,doc) {
               res.render('index.html', { "repo":doc } );
            });
         }catch{
            console.log('ok3');
            var doc = {
               date : "NO",
					Envoyeur :"CURRENT",
					Receveur :"DATA :",
					Commentaire :"Any torpille are sent yet"
            };
            res.render('index.html', { "repo":doc } );
         }
         
      }else{
         res.render("login.html",{message :"Vous devez être connecté pour voir l'historique"});
      };      
   });


      /*---------- ADD TORPILLE TO DATABASE ----------*/

   app.get('/new.html',(req,res) =>{
      if(req.session.username){
            dbb.estimatedDocumentCount().then(function(size){
               dbb.find().skip(size-1).toArray(function(err,doc){
                  try{
                     var r = doc[0];
                     res.render('new.html',{'repo':r});
                  } catch{
                     var r = {
                        date : "NO",
                        Envoyeur :"CURRENT",
                        Receveur :"DATA :",
                        Commentaire :"Any torpille are sent yet"
                     };
                     res.render('new.html',{'repo':r});
                  };
                      
               });
            });
      }else{
         res.render("login.html",{message : "Vous devez être connecté pour envoyer une torpille"});
      };
   });
   app.get('/send', function(req,res) {
      if (req.query.InputBoxEmetteur=="" ||req.query.InputBoxRecepteur=="" ||req.query.InputBoxCommentaire=="" || req.query.InputDate=="" ){
         res.render('new.html', {succes : "Erreur : Remplissez tous les données correctement"} );
      };
      dbb.estimatedDocumentCount().then(function(size){
         dbb.insertOne({ "date" : req.query.InputDate, "Envoyeur" : req.query.InputBoxEmetteur, "Receveur" : req.query.InputBoxRecepteur,"Commentaire" : req.query.InputBoxCommentaire, "num" : size+1 })
      });
      res.render('new.html', {succes : "La torpille est partie"} );
   });

         /*---------- SEARCH ----------*/
   app.get('/search', function(req,res){
      if(req.session.username){
         try{
            dbb.createIndex( { "date" : "text", "Envoyeur" : "text", "Receveur" : "text", "commentaire":"text"});
            dbb.find( { $text: { $search: req.query.searched } }).toArray(function(err,doc){
               res.render('search.html',{'repo':doc});
               });

         }catch  {
            console.log('error while searching');
            res.redirect("/home.html");
         };
      }else {
         res.render("login.html",{message : "Vous devez être connecté pour effectuer une recherche"});
      }
   });
   
      /*---------- ERROR 404 (DEFAULT_PAGE) ----------*/

   app.get('*', (req, res) => {
      res.status(404).send("Page introuvabe : retourner sur la page d'accueil");
   }); 
});


https.createServer(
   {
   key: fs.readFileSync('./key.pem'),
   cert: fs.readFileSync('./cert.pem'),
   passphrase: 'ingi'
 }, app).listen(8080);
console.log('Express server started on port 8080');


