const {
  registerUser,
  registerAuthor,
  login,
} = require('../services/auth.service');

const respondWithError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'An unexpected error occurred.',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const user = await registerUser(req.body || {});
    res.status(201).json({
      success: true,
      data: user,
      message: 'Registered successfully as user.',
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.registerAuthor = async (req, res) => {
  try {
    const user = await registerAuthor(req.body || {});
    res.status(201).json({
      success: true,
      data: user,
      message: 'Registered successfully as author.',
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await login(req.body || {});
    res.status(200).json({
      success: true,
      data: user,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    respondWithError(res, error);
  }
};
