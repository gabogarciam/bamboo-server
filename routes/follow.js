'use strict';
const express = require('express');
const router = express.Router();

// const User = require('../models/user');
const Follow = require('../models/follow');

// -- Follow someone --//
router.post('/save-follow', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }
  // const reqBody = req.body;
  const follow = new Follow();

  // follow.user = req.user.id;
  follow.user = req.session.currentUser._id;
  follow.followed = req.body.followed;

  follow.save()
    .then((followdStored) => {
      if (!followdStored) return res.status(400).send({code: 'unsaved'});
      return res.status(200).send({follow: followdStored});
    })
    .catch(next);

//   follow.save((error, followdStored) => {
//     if (error) return res.status(500).send({code: 'unexpected'});
//     if (!followdStored) return res.status(400).send({code: 'unsaved'});
//     return res.status(200).send({follow: followdStored});
//   });
});

// -- Unfollow someone --//
router.delete('/unfollow', (req, res, next) => {
//   if (req.session.currentUser) {
//     return res.status(401).json({code: 'unauthorized'});
//   }
  const userId = req.session.currentUser._id;
  const followId = req.body.followId;

  Follow.find({'user': userId, 'followed': followId}).remove()
    .then(() => {
      return res.status(200).send({code: 'unfollow user'});
    })
    .catch(next);

  //   Follow.find({'user': userId, 'followed': followId}).remove(error => {
  //     if (error) return res.status(500).send({code: 'unexpected'});
  //     return res.status(200).send({code: 'unfollow user'});
  //   });
});

// -- List of users that I follow --//
router.get('/following-users', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const userId = req.session.currentUser._id;

  Follow.find({user: userId}).populate({path: 'followed'})
    .then((follows, total) => {
      if (!follows) res.status(404).send({code: 'you dont follow any user'});
      return res.status(200).send({
        total: total,
        follows
      });
    })
    .catch(next);
});

// -- List of users who follow me --//
router.get('/followed-users', (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({code: 'unauthorized'});
  }

  const userId = req.session.currentUser._id;

  Follow.find({followed: userId}).populate('user')
    .then((follows, total) => {
      if (!follows) res.status(404).send({code: 'no user follows you'});
      return res.status(200).send({
        total: total,
        follows
      });
    })
    .catch(next);
});

module.exports = router;
