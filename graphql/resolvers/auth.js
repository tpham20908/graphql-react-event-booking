const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User already exists.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null, id: result.id }
    } catch (err) {
      throw err;
    }
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist.');
    }
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      throw new Error('Password does not match.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'thisisaverysecrettoken',
      { expiresIn: '1h' }
    );

    return {
      userId: user.id,
      token,
      tokenExpiration: 1
    }
  }
}