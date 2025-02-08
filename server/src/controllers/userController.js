import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
console.log("name, email, password",name, email, password)
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();
    // const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '1d' });
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.__v;
    
    res.status(200).json({ message: "User logged in", token, user:userObject });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
