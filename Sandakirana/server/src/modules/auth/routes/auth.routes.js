const express = require('express');
const {
  registerUser,
  registerAuthor,
  login,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register/user', registerUser);
router.post('/register/author', registerAuthor);
router.post('/login', login);

module.exports = router;
