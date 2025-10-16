const User = require('../../users/models/user.model');
const { sanitizeUser } = require('../../users/services/user.service');

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const register = async (payload, role) => {
  const { name, email, password } = payload || {};

  if (!name || !email || !password) {
    throw createHttpError(400, 'Name, email, and password are required.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'An account with this email already exists.');
  }

  const user = new User({ name, email, role });
  user.setPassword(password);
  await user.save();

  return sanitizeUser(user);
};

const login = async (payload) => {
  const { email, password } = payload || {};

  if (!email || !password) {
    throw createHttpError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.validatePassword(password)) {
    throw createHttpError(401, 'Invalid email or password.');
  }

  return sanitizeUser(user);
};

module.exports = {
  registerUser: (payload) => register(payload, 'user'),
  registerAuthor: (payload) => register(payload, 'author'),
  login,
};
