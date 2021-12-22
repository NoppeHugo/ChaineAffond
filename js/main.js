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





 MongoClient.connect('mongodb://localhost:27017', (err, db) => {
	const dbo = db.db("data_torpille").collection('index');
    if (err) throw err;
    app.get('/index.html', (req, res) => {
        dbo.find({}).toArray(function(err,doc) {
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

     /*Ajouter/Envoyer une torpille */
     app.get('/new.html',(req,res) =>{
      dbo.estimatedDocumentCount().then(function(size){
         dbo.find().skip(size-1).toArray(function(err,doc){
           res.render('new.html',doc[0]);    
            });
         });
      });
      app.get('/send', function(req,res) {
         if (req.query.InputBoxEmetteur=="" ||req.query.InputBoxRecepteur=="" || req.query.InputDate=="" ){
            res.render('new.html', {succes : "Erreur : Remplissez tous les données correctement"} );
         }
         dbo.estimatedDocumentCount().then(function(size){
            dbo.insertOne({ "date" : req.query.InputDate, "Envoyeur" : req.query.InputBoxEmetteur, "Receveur" : req.query.InputBoxRecepteur, "commentaire" : size+1 })
         });
         res.render('new.html', {succes : "successfully send"} );
         
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
