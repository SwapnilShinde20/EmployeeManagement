import jwt from 'jsonwebtoken';
import {User} from '../models/User.models.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;  

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // Assuming `req.user` is populated after authentication middleware
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Return the user details (excluding sensitive information if needed)
    const { id, name, email, role ,token} = req.user;

    res.status(200).json({
      user:{
        _id: id,
        name: name,
        email: email,
        role: role,
        token: token
      }
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
}
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

export {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser
}