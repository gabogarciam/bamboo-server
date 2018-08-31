'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// -- Upload images -- //
// const multer = require('multer');
// const upload = multer({dest: '../uploads/users'});

const multipart = require('connect-multiparty');
const multipartUpload = multipart({uploadDir: './uploads/users'});

// -- Models -- //
const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');

router.get('/refresh', (req, res, next) => {
  if (req.session.currentUser) {
    User.findById(req.session.currentUser._id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({code: 'not-found'});
        }
        req.session.currentUser = user;
        res.json(req.session.currentUser);
      })
      .catch(next);
  } else {
    res.status(404).json({code: 'not-found'});
  }
});

/* GET a specifically user */
router.get('/find/:id?', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }
  const userId = req.params.id;

  const userlogged = req.session.currentUser._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({code: 'not-found'});
      }
      Follow.findOne({'user': userlogged, 'followed': userId}).exec((error, follow) => {
        if (error) return res.status(500).send({code: 'unexpected'});
        return res.json({user, follow});
      });
    })
    .catch(next);
});

/* GET all user's in the Database */
router.get('/list', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  User.find()
    .then((users) => {
      return res.json(users);
    })
    .catch(next);
});

/* Edit user */
router.put('/edit', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const userId = req.session.currentUser._id;
  const reqBody = req.body;
  const username = req.body.username;

  delete reqBody.password;
  delete reqBody.role;

  /* En una mejora futura verificar que el email ya exite */
  User.findOne({username}, 'username')
    .then((userExists) => {
      if (userExists.id !== userId) {
        return res.status(422).json({code: 'username-not-unique'});
      }
      User.findByIdAndUpdate(userId, reqBody, {new: true})
        .then(user => {
          if (!user) {
            return res.status(404).json({code: 'not-found'});
          }
          req.session.currentUser = user;
          return res.json(user);
        })
        .catch(next);
    })
    .catch(next);
});

/* upload avatar user */
router.post('/upload-avatar', multipartUpload, (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const userId = req.session.currentUser._id;
  const reqBody = req.body;

  delete reqBody.password;
  delete reqBody.role;

  User.findById(userId)
    .then((userExists) => {
      if (userExists && req.files) {
        const filePath = req.files.photo.path;
        const fileSplit = filePath.split('/');
        const fileName = fileSplit[2];
        const extSplit = fileName.split('.');
        const fileExt = extSplit[1];

        if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif') {
          User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdate) => {
            if (err) return res.status(500).send({code: 'unexpected'});
            if (!userUpdate) return res.status(404).send({code: 'user-dont-updated'});

            req.session.currentUser = userUpdate;
            return res.status(200).send({user: userUpdate});
          });
        } else {
          return removeFilesUpload(res, filePath, 'Invalid-extension');
        }
      } else {
        return res.status(200).send({ code: 'image-not-found' });
      }
    })
    .catch(next);

  function removeFilesUpload (res, filePath, message) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(200).send({code: message});
      }
    });
  }
});

router.get('/get-avatar', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }
  const userId = req.session.currentUser._id;
  const avartarFile = req.session.currentUser.image;
  const pathFile = './uploads/users/' + avartarFile;

  User.findById(userId, {new: true})
    .then(() => {
      fs.stat(pathFile, (error, stats) => {
        if (!error) {
          res.sendFile(path.resolve(pathFile));
        } else {
          return res.status(200).send({code: 'avatar dont exist'});
        }
      });
    })
    .catch(next);
});

// Counter Followin and follow
router.get('/counters-follow/:id?', (req, res, next) => {
  let userId = req.session.currentUser._id;

  if (req.params.id) {
    userId = req.params.id;
  }

  getCountFollow(userId)
    .then((value) => {
      return res.status(200).send(value);
    })
    .catch(next);
});

async function getCountFollow (userId) {
  let promise1 = Follow.count({'user': userId});
  let promise2 = Follow.count({'followed': userId});
  let promise3 = Publication.count({'user': userId});

  return Promise.all([promise1, promise2, promise3])
    .then(results => {
      return {
        following: results[0],
        followed: results[1],
        publications: results[2]
      };
    });
}

module.exports = router;
