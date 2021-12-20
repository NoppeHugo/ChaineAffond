let express = require('express'),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;

let app = express();
app.engine('html', engines.hogan);
app.set('view engine', 'html');
app.set('static', __dirname);

MongoClient.connect('mongodb://localhost:27017', (err, db) => {
	dbo = db.db("data_torpille");
    if (err) throw err;
    app.get('/', (req, res) => {
        res.render("../static/home.html");
        });
    app.get('/index', (req, res) => {
        dbo.collection('index').findOne({Receveur:"tom"},(err, doc) => {
            if (err) throw err;
            res.render('../static/index.html',doc);
            });
    });
    app.get('*', (req, res) => {
        res.status(404).send('Page Not Found oupsi');
    });

    app.listen(8080);
    console.log('Express server started on port 8080');
});