const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const User = require('../models/Users')
const auth = require('../middleware/auth')

const router = express.Router();

//desc user login
//route POST api/auth
//acess Public
router.post('/',[
    check('email', 'Please enter valid email').isEmail(),
    check('password', 'Please enter valid password').exists()
], async (req, res) => {
        try {
            const errors = validationResult(req);
            
            if(!errors.isEmpty()){
                return res.status(400).json({errors:errors.array()});
            }
            else{
                const {email, password} = req.body;
    
                let user = await User.findOne({email});
                if(!user){
                    return res.status(400).json({msg:'Incorrect Credentials'});
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if(!isMatch){
                    return res.status(400).json({msg:'Incorrect Credentials'});
                }

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
        
    } catch (error) {
        console.warn(error.message);
        res.status(500).send("Server Error");
    }
}

);

//desc getting user who logged in
//route GET api/auth
//acess Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.warn(err.message);
        res.status(500).send('Server Error');
    }

});

module.exports = router;