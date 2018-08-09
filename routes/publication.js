'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// const moment = require('moment');

const multipart = require('connect-multiparty');
const multipartUpload = multipart({uploadDir: './uploads/publications'});

const Publication = require('../models/publication');
// const User = require('../models/user');
// c onst Follow = require('../models/follow');

router.post('/save-publication', (req, res, next) => {
//   if (req.session.currentUser) {
//     return res.status(401).json({code: 'unauthorized'});
//   }

  const reqBody = req.body;

  if (!reqBody.text) res.status(404).send({code: 'no text has been sent'});

  const publication = new Publication();
  publication.text = reqBody.text;
  publication.file = 'null';
  publication.user = req.session.currentUser._id;

  publication.save()
    .then((publicationStored) => {
      return res.status(200).send({publicationStored});
    })
    .catch(next);
});

router.get('/get-publication/:id?', (req, res, next) => {
  const publicationId = req.params.id;

  Publication.findById(publicationId)
    .then((publication) => {
      return res.status(200).send(publication);
    })
    .catch(next);
});

router.delete('/delete-publication/:id?', (req, res, next) => {
  const publicationId = req.params.id;
  const userId = req.session.currentUser._id;

  Publication.find({'user': userId, '_id': publicationId}).remove((error, publicationRemoved) => {
    if (error) return res.status(500).send({code: 'unexpected'});
    if (!publicationRemoved) return res.status(404).send({code: 'Publication dont removed'});
    return res.status(200).send({publication: publicationRemoved});
  });
});

/* upload files to publication */
router.post('/upload-image-publication/:id', multipartUpload, (req, res, next) => {
  // if (req.session.currentUser) {
  //   return res.status(401).json({code: 'unauthorized'});
  // }

  let publicationId = req.params.id;

  const reqBody = req.body;
  delete reqBody.password;
  delete reqBody.role;

  if (req.files) {
    const filePath = req.files.image.path;
    const fileSplit = filePath.split('/');
    const fileName = fileSplit[2];
    const extSplit = fileName.split('.');
    const fileExt = extSplit[1];

    if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif') {
      Publication.findByIdAndUpdate(publicationId, {file: fileName}, {new: true}, (err, publicationUpdate) => {
        if (err) return res.status(500).send({code: 'unexpected'});
        if (!publicationUpdate) return res.status(404).send({code: 'user dont updated'});

        req.session.currentUser = publicationUpdate;
        return res.status(200).send({publication: publicationUpdate});
      });
    } else {
      return removeFilesUpload(res, filePath, 'Invalid extension');
    }
  } else {
    return res.status(200).send({ code: 'image not found' });
  }

  function removeFilesUpload (res, filePath, message) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(200).send({code: message});
      }
    });
  }
});

router.get('/get-image-publication/:id', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const avartarFile = req.session.currentUser.image;
  const pathFile = './uploads/publications/' + avartarFile;

  fs.stat(pathFile, (error, stats) => {
    if (!error) {
      res.sendFile(path.resolve(pathFile));
    } else {
      return res.status(200).send({code: 'file dont exist'});
    }
  });
});

module.exports = router;
