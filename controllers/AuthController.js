// import jwt from "jsonwebtoken";
// import User from "../models/UserModel.js";
// //import { compare } from "bcryptjs";
// import bcrypt from 'bcryptjs';

// import { rename,unlink  } from 'fs/promises'; 

// const maxAge = 3*24*60*60*1000;

// const createToken = (email, userId) => {
//   return jwt.sign({email,userId}, process.env.JWT_KEY, {expiresIn: maxAge});
// };

// export const signup = async (req,res,next) => {
//     try {
//         const {email, password} = req.body;
//         if(!email || !password){
//             return res.status(400).send("Email and Password is required");
//         }
//         const user = await User.create({email, password});
//         res.cookie("jwt", createToken(email, user.id),{
//             maxAge,
//             secure: true,
//             sameSite: "None",
//             httpOnly: true,
//         });
//         return res.status(201).json({
//           user: {
//             id: user.id,
//             email: user.email,
//             profileSetup: user.profileSetup
//           }
//         });

//     } catch (error) {
//         console.log({error});
//         return res.status(500).send("Internal Server Error");
//     }
// };

// export const login = async (req,res,next) => {
//     try {
//         const {email, password} = req.body;
//         if(!email || !password){
//             return res.status(400).send("Email and Password is required");
//         }
//         const user = await User.findOne({email});
//         if(!user){
//             return res.status(404).send("User with given email is not found.");
//         }
//         const auth = await bcrypt.compare(password, user.password);
//         if(!auth){
//             return res.status(400).send("Password is incorrect.");
//         }
//         res.cookie("jwt", createToken(email, user.id),{
//             maxAge,
//             secure: true,
//             sameSite: "None",
//             httpOnly: true,
//         });
//         return res.status(200).json({
//           user: {
//             id: user.id,
//             email: user.email,
//             profileSetup: user.profileSetup,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             image: user.image,
//             color: user.color
//           }
//         });

//     } catch (error) {
//         console.log({error});
//         return res.status(500).send("Internal Server Error");
//     }
// }

// export const getUserInfo = async (req, res) => {
//     try {
//         // Check if userId exists in the request
//         if (!req.userId) {
//             return res.status(400).json({ message: "User ID is missing from the request." });
//         }

//         // Fetch user data from the database
//         const userData = await User.findById(req.userId);

//         // Check if user data was found
//         if (!userData) {
//             return res.status(404).json({ message: "User with the given ID was not found." });
//         }

//         // Respond with user information
//         return res.status(200).json({
//             id: userData.id,
//             email: userData.email,
//             profileSetup: userData.profileSetup,
//             firstName: userData.firstName,
//             lastName: userData.lastName,
//             image: userData.image,
//             color: userData.color
//         });
//     } catch (error) {
//         console.error("Error retrieving user information:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// export const updateProfile = async (req,res,next) => {
//     try {
//         const {userId} = req;
//         const {firstName, lastName, color} = req.body;

//         // Check if user data was found
//         if (!firstName || !lastName || !color) {
//             return res.status(404).json({ message: "firstName lastName and color is required." });
//         }

//         const userData = await User.findByIdAndUpdate(userId, {
//             firstName,
//             lastName,
//             color,
//             profileSetup:true
//         },
//         {new:true, runValidators:true}
//         );
//         // Respond with user information
//         return res.status(200).json({
//             id: userData.id,
//             email: userData.email,
//             profileSetup: userData.profileSetup,
//             firstName: userData.firstName,
//             lastName: userData.lastName,
//             image: userData.image,
//             color: userData.color
//         });
//     } catch (error) {
//         console.error("Error retrieving user information:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }


// export const addProfileImage = async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send("File is required");
//       }
  
//       const date = Date.now();
//       const fileName = "uploads/profiles/" + date + req.file.originalname;
  
//       // Rename the file to include the timestamp
//       await rename(req.file.path, fileName);
  
//       // Update the user with the new profile image path
//       const updatedUser = await User.findByIdAndUpdate(
//         req.userId,
//         { image: fileName },
//         { new: true, runValidators: true }
//       );
  
//       // Send back the updated user image
//       return res.status(200).json({
//         image: updatedUser.image,
//       });
//     } catch (error) {
//       console.error("Error updating profile image:", error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   };


// export const removeProfileImage = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).send("User not found.");
//     }

//     if (user.image) {
//       try {
//         await unlink(user.image);
//       } catch (err) {
//         console.error("Error deleting file:", err);
//         return res.status(500).json({ message: "Error removing profile image" });
//       }
//     }

//     user.image = null;
//     await user.save();

//     return res.status(200).send("Profile image removed successfully");
//   } catch (error) {
//     console.error("Error retrieving user information:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };



import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import { rename, unlink } from 'fs/promises'; 

const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

// Sign-up Controller
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }

    const user = await User.create({ email, password });

    // Set cookie with SameSite=None and Secure=true for cross-origin requests
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure Secure is true in production (HTTPS)
      sameSite: "None", // SameSite=None allows cross-site cookies
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      }
    });

  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

// Login Controller
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User with given email not found.");
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).send("Password is incorrect.");
    }

    // Set cookie with SameSite=None and Secure=true for cross-origin requests
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure for HTTPS
      sameSite: "None", // Cross-site
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      }
    });

  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

// Logout Controller
export const logout = async (req, res, next) => {
  try {
    // Clear cookie by setting it to expire immediately
    res.cookie("jwt", "", {
      maxAge: 1, // Immediately expire
      secure: process.env.NODE_ENV === "production", // Secure for HTTPS
      sameSite: "None", // Cross-site
    });

    return res.status(200).send("Logout Successful.");
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get User Info Controller
export const getUserInfo = async (req, res) => {
  try {
    // Check if userId exists in the request
    if (!req.userId) {
      return res.status(400).json({ message: "User ID is missing from the request." });
    }

    // Fetch user data from the database
    const userData = await User.findById(req.userId);

    // Check if user data was found
    if (!userData) {
      return res.status(404).json({ message: "User with the given ID was not found." });
    }

    // Respond with user information
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;

    // Check if user data was found
    if (!firstName || !lastName || !color) {
      return res.status(404).json({ message: "First name, last name, and color are required." });
    }

    const userData = await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      color,
      profileSetup: true
    },
    { new: true, runValidators: true }
    );

    // Respond with user information
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add Profile Image Controller
export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    const fileName = "uploads/profiles/" + date + req.file.originalname;

    // Rename the file to include the timestamp
    await rename(req.file.path, fileName);

    // Update the user with the new profile image path
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    // Send back the updated user image
    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove Profile Image Controller
export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    if (user.image) {
      try {
        await unlink(user.image); // Delete the image file from the server
      } catch (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ message: "Error removing profile image" });
      }
    }

    user.image = null; // Set the image field to null in the database
    await user.save();

    return res.status(200).send("Profile image removed successfully");
  } catch (error) {
    console.error("Error removing profile image:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// export const logout = async (req, res, next) => {
//   try {
//     res.cookie("jwt","",{maxAge:1, secure:true, sameSite:"None"});
//     return res.status(200).send("LogOut Successfull.");
//   } catch (error) {
//     console.error("Error retrieving user information:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };



