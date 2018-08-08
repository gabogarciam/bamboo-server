'use strict';
const express = require('express');
const router = express.Router();

// const User = require('../models/user');
const Follow = require('../models/follow');

router.post('/save-follow', (req, res, next) => {
//   if (req.session.currentUser) {
//     return res.status(401).json({code: 'unauthorized'});
//   }
  // const reqBody = req.body;
  const follow = new Follow();

  // follow.user = req.user.id;
  follow.user = req.session.currentUser._id;
  follow.followed = req.body.followed;

  follow.save((error, followdStored) => {
    if (error) return res.status(500).send({code: 'unexpected'});
    if (!followdStored) return res.status(400).send({code: 'unsaved'});
    return res.status(200).send({follow: followdStored});
  });

  return res.status(200).send({code: 'Hello testing Follow'});
});

module.exports = router;
