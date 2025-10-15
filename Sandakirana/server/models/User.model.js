const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'author'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

const hashPassword = (password, salt) => {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, finalSalt, 10000, 64, 'sha512')
    .toString('hex');
  return `${finalSalt}:${hash}`;
};

userSchema.methods.setPassword = function setPassword(password) {
  this.password = hashPassword(password);
};

userSchema.methods.validatePassword = function validatePassword(password) {
  if (!this.password) {
    return false;
  }
  const [salt, storedHash] = this.password.split(':');
  const attemptedHash = hashPassword(password, salt).split(':')[1];
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const attemptBuffer = Buffer.from(attemptedHash, 'hex');

  if (storedBuffer.length !== attemptBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, attemptBuffer);
};

module.exports = mongoose.model('User', userSchema);

