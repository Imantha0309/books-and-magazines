const User = require('../models/User.model');

const sanitizeUser = (userDoc) => {
  const doc = userDoc.toObject({ getters: true });
  delete doc.password;
  delete doc.__v;
  const id = doc._id ? doc._id.toString() : '';
  return {
    id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const handleRegistration = async (req, res, desiredRole) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = new User({ name, email, role: desiredRole });
    user.setPassword(password);
    await user.save();

    return res.status(201).json({
      success: true,
      data: sanitizeUser(user),
      message: `Registered successfully as ${desiredRole}.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.registerUser = (req, res) => handleRegistration(req, res, 'user');
exports.registerAuthor = (req, res) => handleRegistration(req, res, 'author');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.validatePassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: 'Logged in successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
