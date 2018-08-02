'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(422).json({code: 'validation'});
  }

  User.findOne({username}, 'username')
    .then((userExists) => {
      if (userExists) {
        return res.status(422).json({code: 'username-not-unique'});
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = User({
        username,
        password: hashPass
      });

      return newUser.save()
        .then(() => {
          req.session.currentUser = newUser;
          res.json(newUser);
        });
    })
    .catch(next);
});

module.exports = router;
