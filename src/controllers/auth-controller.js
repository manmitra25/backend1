
const User = require('../models/user-model')
const bcrypt = require('bcrypt')
const home = async (req,res) => {
  try {
    res.send("Welcome to the home page")
  } catch (error) {
    res.status(500).json({message: "error from home controller"})
  }
}

const signup = async (req,res) => {
  try {
    const {nickname,password} = req.body;

    let checkUser = await User.findOne({nickname});

    if(checkUser) { return res.json({message:"ALready have an account please login"})}
    let isAdmin;
    let createUser = await User.create({nickname,password,isAdmin})
    return res.json(createUser)

  } catch (error) {
    console.log("error from signup controller",error);
    
    res.status(500).json({message: "error from signup controller"})
  }
}

const login = async (req, res, next) => {
  try {
      const { email, password } = req.body;

      // Check if user exists
      const checkuser = await User.findOne({ email });

      if (!checkuser) {
          return res.status(401).json({ message: "Invalid Credentials" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, checkuser.password);
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      // If credentials are correct, return token
      res.status(200).json({ 
          msg: "User login successfully",
          user:checkuser ,
          token: await checkuser.generateToken(),
          userId: checkuser._id.toString()
      });
     

  } catch (error) {
      next(error);  // Pass error to middleware
  }
};

const user = async (req, res) => {
  try {
    // const userData = await User.find({});
    const userData = req.user;
    console.log(userData);
    return res.status(200).json(userData );
  } catch (error) {
    console.log(` error from user route ${error}`);
  }
};

const anon = async (req, res) => {
  try {
    // const userData = await User.find({});
    const userData = req.user;
    console.log(userData);
    return res.status(200).json(userData );
  } catch (error) {
    console.log(` error from anon route ${error}`);
  }
};

const getUserbyId = async (req,res,next) => {
  try {
      const id= req.params.id;
      const user=await User.findById({_id:id},{password:0});
      console.log(user);
      
      if(!user){
          return res.status(404).json({message:"No user"})
      }else{
          return res.status(200).json(user)
      }
  } catch (error) {
      next(error)
  }
}

const getAllUsers = async(req,res,next) =>
  {
      try {
          const users=await User.find({},{password:0});
          console.log(users);
          
          if(!users || users.length===0){
              return res.status(404).json({message:"No users"})
          }else{
              return res.status(200).json(users)
          }
      } catch (error) {
          next(error);
      }
  }

  const deleteUserById = async (req,res,next) => {
    try {
   
       const id =req.params.id;
       await User.deleteOne({_id:id})
       return  res.status(200).json({message:"User deleted Successfully"})
    } catch (error) {
       next(error)
    }
   }
   const mongoose = require("mongoose");
   const updateUserbyId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateUserMaintainance = req.body;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Prevent updating with an empty body
        if (!Object.keys(updateUserMaintainance).length) {
            return res.status(400).json({ message: "No update data provided" });
        }

        // Check if record exists before updating
        const existingData = await User.findById(id);
        if (!existingData) {
            return res.status(404).json({ message: "No record found with this ID" });
        }

        // Perform the update
        const updateData = await User.findByIdAndUpdate(
            id,
            { $set: updateUserMaintainance },
            { new: true, runValidators: true } // Return updated document and validate changes
        );

        if (!updateData) {
            return res.status(400).json({ message: "No changes made to the document" });
        }

        return res.status(200).json(  updateData );

    } catch (error) {
        console.error("Error updating maintenance:", error);
        next(error);
    }
};



module.exports = { home , signup , login , user , getUserbyId,getAllUsers,deleteUserById,updateUserbyId}