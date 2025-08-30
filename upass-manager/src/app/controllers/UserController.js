const User = require('../models/UserModel');

exports.createUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.create({ email, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};