import  User  from "../models/userModel.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    return { accessToken };
  } catch (error) {
    return res.status.json({
      message:
        "Something went wrong while generating referesh and access token",
    });
  }
};


// thsi regintaruser contronalr
const registerUser = async (req, res) =>{
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "User already exists" })
    }

    const user = await User.create({
        name,
        email,
        password,
    })
    const createduser = await User.findById(user._id).select("-password")

    if (!createduser) {
      return res.status(500).json({ message: "User creation failed" });
    }

    return res.status(201).json({
      message: "User created successfully",
      data: createduser
    });


  } catch (error) {
    
  }
}

// this is logoin user cntroler
 const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
  
    const isPasswordValid = await user.isPasswordCorrect(password);
  
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid user credentials" });
    }
  
    // token generate
    const { accessToken } = await generateAccessAndRefereshTokens(user._id);
  
    const loggedInUser = await User.findById(user._id).select(
      "-password"
    );
  
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json({
        status: 200,
        data: {
          user: loggedInUser,
          accessToken,
        },
        message: "User logged in successfully",
      });
  } catch (error) {
     console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// this is logout user cntroler
const logoutUser = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false
    };

    return res
      .status(200)
      .clearCookie("accessToken", options) 
      .json({
        status: 200,
        data: {},
        message: "Access token cleared successfully"
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error"
    });
  }
};




// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.find({ email });

//     if (user) {
//       const isValidPassword = await bcrypt.compare(password, user[0].password);
//       if (isValidPassword) {
//         const token = jwt.sign(
//           { email: user.email, userId: user._id },
//           process.env.JWT_SECRET,
//           {
//             expiresIn: "1h",
//           }
//         );
//         res.status(200).json({
//           message: "User Login Successfully",
//           accessToken: token,
//           data: {
//             name: user[0].name,
//             email,
//             userId: user[0]._id,
//           },
//         });
//       } else {
//         res.status(500).send("err.message is");
//       }
//     }
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// };

// @desc Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email query is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { loginUser,logoutUser,registerUser};
