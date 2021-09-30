const { genSalt } = require('bcryptjs');
const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const User = require('../models/Users')


//desc registers users
//route POST api/users
//access public

router.post('/',[check('name', 'Please include your name')
.not()
.isEmpty(),
check('email', 'Please include email')
.isEmail(),
check('password', 'Password must include 6 characters and more')
.isLength({min:6})
],
async (req, res) => {

    try {
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        else{
            const {name, email, password} = req.body;

            let user = await User.findOne({email});
            if(user){
                return res.status(400).json({msg:'User already exists'});
            }
            
            user = new User({
                name,
                email,
                password
            });

            let salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();
            
            const payload = {
                user:{
                    id:user.id
                }
            };

            jwt.sign(payload, config.get('jwtsecret') , {
                expiresIn:36000
            }, (err, token) => {
                if(err) throw err;

                res.json({token});
            })

        }
        
    } catch (err) {

        console.error(err.message);
        res.status(500).send("Serveryi Error");
        
    }
});

module.exports = router;