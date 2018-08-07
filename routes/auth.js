'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multipart = require('connect-multiparty');
const fs = require('fs');
const path = require('path');

const multipartUpload = multipart({uploadDir: './uploads/users'});

const User = require('../models/user');

/* GET users listing. */
router.get('/me', (req, res, next) => {
  if (req.session.currentUser) {
    res.json(req.session.currentUser);
  } else {
    res.status(404).json({code: 'not-found'});
  }
});

router.get('/refreshUser', (req, res, next) => {
  if (req.session.currentUser) {
    User.findById(req.session.currentUser._id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({code: 'not-found'});
        }
        req.session.currentUser = user;
        res.json(req.session.currentUser);
      })
      .catch(error => {
        return res.json(error);
      });
  } else {
    res.status(404).json({code: 'not-found'});
  }
});

/* GET a specifically user */
router.get('/user', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }
  const userId = req.headers.userid;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({code: 'not-found'});
      }
      return res.json(user);
    })
    .catch(error => {
      return res.json(error);
    });
});

/* GET all user's in the Database */
router.get('/users', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  User.find()
    .then((users) => {
      return res.json(users);
    })
    .catch(error => {
      return res.json(error);
    });
});

/* POST */
router.post('/signup', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const username = req.body.username;
  const email = null;
  const password = req.body.password;
  const role = 'ROLE_USER';
  const image = null;

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
        email,
        password: hashPass,
        role,
        image
      });

      return newUser.save()
        .then(() => {
          req.session.currentUser = newUser;
          res.json(newUser);
        });
    })
    .catch(next);
});

router.post('/login', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(422).json({code: 'validation'});
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({code: 'not-found'});
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        return res.json(user);
      } else {
        return res.status(404).json({code: 'not-found'});
      }
    })
    .catch(next);
});

router.post('/logout', (req, res) => {
  req.session.currentUser = null;
  return res.status(204).send();
});

/* Edit user */
router.put('/edit-user', (req, res, next) => {
  // if (req.session.currentUser) {
  //   return res.status(401).json({code: 'unauthorized'});
  // }

  const userId = req.body._id;
  const reqBody = req.body;

  delete reqBody.password;
  delete reqBody.role;

  User.findByIdAndUpdate(userId, reqBody, {new: true})
    .then(user => {
      if (!user) {
        return res.status(404).json({code: 'not-found'});
      }
      return res.json(user);
    })
    .catch(error => {
      return next(error);
    });
});

/* upload avatar user */

router.post('/upload-avatar-user', multipartUpload, (req, res, next) => {
  // if (req.session.currentUser) {
  //   return res.status(401).json({code: 'unauthorized'});
  // }
  const userId = req.body._id;

  const reqBody = req.body;
  delete reqBody.password;
  delete reqBody.role;

  User.findByIdAndUpdate(userId, {new: true})
    .then(() => {
      if (req.files) {
        const filePath = req.files.image.path;
        console.log(filePath);
        const fileSplit = filePath.split('/');
        console.log(fileSplit);
        const fileName = fileSplit[2];
        console.log(fileName);
        const extSplit = fileName.split('.');
        console.log(extSplit);
        const fileExt = extSplit[1];
        console.log(fileExt);
        if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif') {
          User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdate) => {
            if (err) return res.status(500).send({code: 'unexpected'});
            if (!userUpdate) return res.status(404).send({code: 'user sont updated'});
            return res.status(200).send({user: userUpdate});
          });
        } else {
          removeFilesUpload(res, filePath, 'Invalid extension');
        }
      } else {
        return res.status(200).send({ code: 'image not found' });
      }
    })
    .catch(error => {
      console.log(error);
      return res.json({error});
    });

  function removeFilesUpload (res, filePath, message) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(200).send({code: message});
      }
    });
  }
});

module.exports = router;
