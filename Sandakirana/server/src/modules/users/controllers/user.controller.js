const {
  listUsers,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../services/user.service');

const respondWithError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'An unexpected error occurred.',
  });
};

exports.getUsers = async (_req, res) => {
  try {
    const users = await listUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await createUser(req.body || {});
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body || {});
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    respondWithError(res, error);
  }
};
