const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');

const User = require('../models/User');

exports.signup = (req, res, next) => {
    const schema = new passwordValidator();
    schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
    if(!schema.validate(req.body.password)){
        return res.status(400).json({message: 'Mot de passe faible'})
    }
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => {
           return res.status(201).json({ message: 'Utilisateur crée'})
        })
        .catch(error => {
            return res.status(400).json({ error })
        });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).json({ error: 'Mot de passe incorrect'});
            }
            res.status(200).json({
                userId : user._id,
                token: jwt.sign(
                    {userId : user._id},
                    'RANDOM_TOKEN_SECRET',
                    {expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};