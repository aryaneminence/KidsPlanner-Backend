const { body, validationResult } = require("express-validator");
const User = require("../models/User.js");
const SocialUser = require("../models/SocialUser.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generator = require("generate-password");
const speakeasy = require("speakeasy");
const sendEmail = require("../Utils/email.js");
const sendEmailForgotPassword = require("../Utils/forgotPasswordEmail.js");
const accountSid = process.env.YOUR_ACCOUNT_SID;
const authToken = process.env.YOUR_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//*Register User
const registerUser = async (request, response) => {
  let errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(401).json({ errors: errors.array() });
  }

  try {
    const { name, userId, password } = request.body;

    const secret = speakeasy.generateSecret({ length: 20 });

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    // Validate email or phone number using regex
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
    const isPhoneNumber = /^\+?\d{1,15}$/.test(userId);

    if (!isEmail && !isPhoneNumber) {
      return response
        .status(401)
        .json({ errors: [{ msg: "Invalid email or phone number format" }] });
    }

    // Check if the user already exists
    let user = await User.findOne({ userId });
    let socialUser = await SocialUser.findOne({ socialUserId: userId });

    if (!user && !socialUser) {
      // Encode the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const userVerified = false;

      if (isEmail) {
        // Save user to the database
        user = new User({
          name,
          userId: userId,
          password: passwordHash,
          verified: userVerified,
          otp,
        });
        await sendEmail(
          userId,
          "Verify Email",
          otp,
          "emailVerification.ejs.html"
        );
        await user.save();
        const user_dataBase_id = user._id;
        response
          .status(200)
          .json({
            msg: "Registration is successful and a verification email has been sent",
            userDataBaseID: user_dataBase_id,
          });
      } else if (isPhoneNumber) {
        user = new User({
          name,
          userId: userId,
          password: passwordHash,
          verified: userVerified,
          otp,
        });
        await user.save();
        const user_dataBase_id = user._id;
        client.messages
          .create({
            body: `Verified your account with this OTP ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
            to: `${userId}`, // Text your number
          })
          .then((message) => console.log(message.sid));
        response
          .status(200)
          .json({
            msg: "Registration is successful and a verification email has been sent",
            userDataBaseID: user_dataBase_id,
          });
      }
    } else {
      return response
        .status(401)
        .json({ errors: [{ msg: "User is already registered" }] });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//*Verify User On Register With OTP ( Email and Phone Number in one API)
const verifyUserOnRegisterWithOtp = async (request, response) => {
  let errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(401).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(request.body.id);
    const userId = user.userId;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
    const isPhoneNumber = /^\+?\d{1,15}$/.test(userId);

    if (isEmail) {
      try {
        if (!user) return response.status(400).send("Invalid User");

        if (user.otp == request.body.otp) {
          user.verified = true;
          await user.save();
          response.status(200).json({
            msg: "Email Verified",
            User: user,
          });
        }
      } catch (error) {
        response.status(500).json({ errors: [{ msg: error.message }] });
      }
    } else if (isPhoneNumber) {
      try {
        if (!user) return response.status(400).send("Invalid User");

        if (user.otp == request.body.otp) {
          user.verified = true;
          user.otp = "";
          await user.save();
          response.status(200).json({
            msg: "Phone Number Verified",
            User: user,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//*Login user
const loginUser = async (request, response) => {
  let errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(401).json({ errors: errors.array() });
  }

  try {
    let { userId, password } = request.body;

    let user;
    user = await User.findOne({ userId });
    let verifiedUser = user.verified;
    if (verifiedUser) {
      // Check if the identifier is an email or a phone number
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
      const isPhoneNumber = /^\+?\d{1,15}$/.test(userId);

      if (!isEmail && !isPhoneNumber) {
        return response
          .status(401)
          .json({ errors: [{ msg: "Invalid email or phone number format" }] });
      }

      if (isEmail) {
        // If it's an email, find the user by email
        user = await User.findOne({ userId: userId });
      } else {
        // If it's a phone number, find the user by phone number
        user = await User.findOne({ userId: userId });
      }

      if (!user) {
        return response
          .status(401)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      } else {
        // Check password
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return response
            .status(401)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        } else{
          // Create a token
          const payload = {
            user: {
              id: user.id,
            },
          };

          if (process.env.JWT_SECRET_KEY) {
            jwt.sign(
              payload,
              process.env.JWT_SECRET_KEY,
              { expiresIn: process.env.EXPIRES_DAY },
              (err, token) => {
                if (err) throw err;
                response.status(200).json({
                  msg: "Login is Success",
                  token: token,
                });
              }
            );
          }
        }
      }
    } else {
      console.log("Not verify");
      response.status(500).json({ errors: [{ msg: "You not verified please verify your account"}]});
    }
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//* register With Google
const register_With_Google = async (data, response) => {
  const userId = data.email;
  const password = generator.generate({
    length: 10,
    numbers: true,
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Save user to the database
  let socialUser = new SocialUser({
    socialUserId: userId,
    password: passwordHash,
  });
  await socialUser.save();

  // Create a token
  const payload = {
    user: {
      id: userId,
    },
  };

  if (process.env.JWT_SECRET_KEY) {
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.EXPIRES_DAY },
      (err, token) => {
        if (err) throw err;
        response.status(200).json({
          msg: "Registration is successful",
          token: token,
        });
      }
    );
  }
};

//* register With FaceBook
const register_With_FaceBook = async (data, response) => {
  const userId = data;
  const password = generator.generate({
    length: 10,
    numbers: true,
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Save user to the database
  let socialUser = new SocialUser({
    socialUserId: userId,
    password: passwordHash,
  });
  await socialUser.save();

  // Create a token
  const payload = {
    user: {
      id: userId,
    },
  };

  if (process.env.JWT_SECRET_KEY) {
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.EXPIRES_DAY },
      (err, token) => {
        if (err) throw err;
        response.status(200).json({
          msg: "Registration is successful",
          token: token,
        });
      }
    );
  }
};

//*register Social
const registerSocial = async (request, response) => {
  let errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(401).json({ errors: errors.array() });
  }
  try {
    if (request.body.googleAccessToken) {
      const { googleAccessToken } = request.body;
      // console.log(request.body.googleAccessToken,"<<<<<<<<<<");
      const decoded = jwt.decode(googleAccessToken);
      const userId = decoded.email;

      let user = await User.findOne({ userId });
      let socialUser = await SocialUser.findOne({ socialUserId: userId });

      if (!user && !socialUser) {
        register_With_Google(decoded, response);
      } else {
        // Create a token
        const payload = {
          user: {
            id: socialUser.id,
          },
        };

        if (process.env.JWT_SECRET_KEY) {
          jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.EXPIRES_DAY },
            (err, token) => {
              if (err) throw err;
              response.status(200).json({
                msg: "Login is successful",
                token: token,
              });
            }
          );
        }
      }
    } else if (request.body.faceBookAccessToken) {
      const { email } = request.body.faceBookAccessToken;
      const userId = email;

      let user = await User.findOne({ userId });
      let socialUser = await SocialUser.findOne({ socialUserId: userId });

      if (!user && !socialUser) {
        register_With_FaceBook(userId, response);
      } else {
        // Create a token
        const payload = {
          user: {
            id: socialUser.id,
          },
        };

        if (process.env.JWT_SECRET_KEY) {
          jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.EXPIRES_DAY },
            (err, token) => {
              if (err) throw err;
              response.status(200).json({
                msg: "Login is successful",
                token: token,
              });
            }
          );
        }
      }
    } else {
    } //! no needed else.
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//*Forgot Password Token
const forgotPasswordToken = async(request, response)=>{
  const { userId } = request.body;
  const user = await User.findOne({ userId });
  if (!user) throw new Error("User not found with this email or number");

  // Validate email or phone number using regex
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
  const isPhoneNumber = /^\+?\d{1,15}$/.test(userId);

  try {
    const payload = {
      user: {
        id: user._id,
        name: user.name,
      },
    };

    if(process.env.JWT_SECRET_KEY){
      jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.EXPIRES_DAY },
        async(err,token)=>{
          if(token){
            const link = `${process.env.BASE_URL}/api/users/reset-password?token=${token}`;
            if(isEmail){
              await sendEmailForgotPassword(
                userId,
                "Verify Email",
                link,
                "emailForgotPasswordToken.ejs.html"
              );
            } else if(isPhoneNumber){
              client.messages
              .create({
                body: `ResetPassword with this Link ${link}`,
                from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
                to: `${userId}`, // Text your number
              })
              .then((message) => console.log(message.sid));
            }

            response.status(201).json({
              user: user,
              token: token,
            });
          } else {
            throw err;
          }
        }
      )
    }
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//* Reset Password
const resetPassword = async(request, response)=>{
  const { id, password } = request.body;

  const id_to_token = await User.findById({_id:id});

  try {
    if(id_to_token){
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const reset_password = await User.findOneAndUpdate({password:passwordHash});
      await reset_password.save();
      return response.status(200).json({ msg: "Password reset successful"});
    }
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//*Get user by ID
const getUserById = async(request,response)=>{
  const { id } = request.params;
  try {
    const getUser = await User.findById(id);
    response.json({getUser});
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//*Get all User
const getallUsers = async (request, response)=>{
  try {
      const getUsers = await User.find();
      const getSocialUser = await SocialUser.find()
      response.json({getUsers,getSocialUser});
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//* Update a user
const updatedUser = async (request, response) => {
  const { id } = request.user;

  const find_user_in_user_collection = await User.findById({_id: id});
  const find_user_in_socialUser_collection = await SocialUser.findById({_id: id});
  try {
    const password = request?.body?.password;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      if(find_user_in_user_collection){
        const updatedUser = await User.findByIdAndUpdate(
          id,
          {
            name: request?.body?.name,
            password: passwordHash,
          },
          {
            new: true,
          }
        );
        response.json(updatedUser);
      } else if(find_user_in_socialUser_collection){
        const updatedUser = await SocialUser.findByIdAndUpdate(
          id,
          {
            name: request?.body?.name,
            password: passwordHash,
          },
          {
            new: true,
          }
        );
        response.json(updatedUser);
      }
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

//*Get a Delet user
const deleteUser = async (request, response) => {
  const { id } = request.params;

  try {
    const find_user_in_user_collection = await User.findById({_id: id});
    const find_user_in_socialUser_collection = await SocialUser.findById({_id: id});

    if(find_user_in_user_collection){
      const deleteUser = await User.findByIdAndDelete(id);
      response.json({
        deleteUser,
      });
    } else if(find_user_in_socialUser_collection){
      const deleteUser = await SocialUser.findByIdAndDelete(id);
      response.json({
        deleteUser,
      });
    }
  } catch (error) {
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerSocial,
  verifyUserOnRegisterWithOtp,
  forgotPasswordToken,
  resetPassword,
  getUserById,
  getallUsers,
  updatedUser,
  deleteUser
};