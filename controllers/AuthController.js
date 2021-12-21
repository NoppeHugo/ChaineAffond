const User      =require('../models/User')
const bcrypt    =require('bcryptjs')
const jwt       =require('jsonwebtoken')

//fonction de création de compte 
const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedPass) {
        if(err){
            res.json({
                error: err
            })
        }

        let user = new User ({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass
        })
        user.save()
        .then(user => {
            res.json({
                message: "Vous êtes inscrits!"
            })
        })
        .catch(error => {
            res.json({
                message: "Erreur!"
            })
        })
    })
}

//fontion de login
const login =(req, res, next) => {
    var username = req.body.username
    var password = req.body.password
    
    User.findOne({$or: [{email:username}]})
    .then(user => {
        if(user){
            bcrypt.compare(password, user.password, function(err, result){
                if(err) {
                    res.json({
                        error: err
                    })
                }
                if(result){
                    let token = jwt.sign({name: user.name}, 'verySecretValue', {expiresIn: '1h'})
                    res.json({
                        message: 'Connecté!',
                        token
                    })
                }else{
                    res.json({
                        message: 'Mauvais mot de passe!'
                    })
                }
            })
        }else{
            res.json({
                message: "Utilisateur introuvable!"
            })
        }
    })
}

module.exports = {
    register
}