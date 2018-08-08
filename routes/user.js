'use strict';

const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const fs = require('fs');
const path = require('path');

const multipartUpload = multipart({uploadDir: './uploads/users'});

const User = require('../models/user');

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
      .catch(error => {
        return res.json(error);
      });
  } else {
    res.status(404).json({code: 'not-found'});
  }
});

/* GET a specifically user */
router.get('/find', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }
  const userId = req.body.userid;

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
router.get('/list', (req, res, next) => {
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

/* Edit user */
router.put('/edit', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const userId = req.session.currentUser._id;
  const reqBody = req.body;

  delete reqBody.password;
  delete reqBody.role;

  User.findByIdAndUpdate(userId, reqBody, {new: true})
    .then(user => {
      if (!user) {
        return res.status(404).json({code: 'not-found'});
      }
      req.session.currentUser = user;
      return res.json(user);
    })
    .catch(error => {
      return next(error);
    });
});

/* upload avatar user */
router.post('/upload-avatar', multipartUpload, (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const userId = req.session.currentUser._id;

  const reqBody = req.body;
  delete reqBody.password;
  delete reqBody.role;

  User.findById(userId)
    .then((user) => {
      if (req.files) {
        const filePath = req.files.image.path;
        const fileSplit = filePath.split('/');
        const fileName = fileSplit[2];
        const extSplit = fileName.split('.');
        const fileExt = extSplit[1];

        if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif') {
          User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdate) => {
            if (err) return res.status(500).send({code: 'unexpected'});
            if (!userUpdate) return res.status(404).send({code: 'user dont updated'});

            req.session.currentUser = userUpdate;
            return res.status(200).send({user: userUpdate});
          });
        } else {
          return removeFilesUpload(res, filePath, 'Invalid extension');
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

router.get('/get-avatar', (req, res, next) => {
  if (req.session.currentUser) {
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
    .catch(error => {
      console.log(error);
      return res.json({error});
    });
});

module.exports = router;
