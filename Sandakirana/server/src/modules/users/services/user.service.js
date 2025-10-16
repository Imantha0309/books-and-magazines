const User = require('../models/user.model');

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) {
    return null;
  }

  const doc = userDoc.toObject({ getters: true });
  delete doc.password;
  delete doc.__v;

  return {
    id: doc._id ? doc._id.toString() : '',
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const listUsers = async () => {
  const users = await User.find();
  return users.map(sanitizeUser);
};

const findUserById = async (id) => {
  const user = await User.findById(id);
  return user ? sanitizeUser(user) : null;
};

const ensureUserExists = async (id) => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  return user;
};

const createUser = async ({ name, email, password, role = 'user' }) => {
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

const updateUser = async (id, updates) => {
  const user = await ensureUserExists(id);

  const { name, email, role, password } = updates;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email.toLowerCase();
  if (role !== undefined) user.role = role;
  if (password) user.setPassword(password);

  await user.save();

  return sanitizeUser(user);
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
};

module.exports = {
  sanitizeUser,
  listUsers,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
};
