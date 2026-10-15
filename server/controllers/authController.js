import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

      if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

      if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }


    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check User
    const user = await User.findOne({ email });

     if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

       if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, a reset link has been sent",
      });
    }

    const resetToken = user.getResetPasswordToken();

   

    await user.save();

   

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")[0]
  .trim();
    const resetUrl=`${clientUrl}/reset-password/${resetToken}`;

    const message = `You requested a password reset.Reset your password using this link:${resetUrl} This link is valid for 15 minutes. If you did not request this, please ignore this email.`;

    try{
       await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    }catch(error){
      console.error("Reset email failed:",error.message);
      user.resetPasswordToken=undefined;
      user.resetPasswordExpire=undefined;
      await user.save();
      return res.status(500).json({
        success:false,
        message:"Could not send the reset email. Please try again later.",
      });

    }

   
    res.status(200).json({
      success: true,
      message: "If this email  is registered,a reset link has been sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
     const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      const existingUser = await User.findOne({
        email: email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const changePassword=async(req,res)=>{
  try{
    const {oldPassword,newPassword}=req.body;
     
    if(!oldPassword || !newPassword){
      return res.status(400).json({
        success:false,
        message:"Old password and new password are required",
      });
    }

      if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user=await User.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }

    // check old password 
    const isMatch=await bcrypt.compare(
      oldPassword,
      user.password
    );

    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"Old password is incorrect",
      });
    }

    const hashedPassword=await bcrypt.hash(newPassword,10);
    user.password=hashedPassword;

    await user.save();
    res.status(200).json({
      success:true,
      message:"Password changed successfully",
    });

  }
  catch(error){
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}


export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
};   
