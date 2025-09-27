import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isSeller = async (req, res, next) => {
  try {
    //extract token from req.headers
    console.log(req.headers);
    // console.log(req.headers.authorization);
    const { authorization } = req.headers;
    console.log(authorization);

    const splitArray = authorization?.split(" "); //optional chaining
    // console.log(splitArray);
    const token = splitArray?.length === 2 ? splitArray[1] : null;
    // console.log(token);

    //is not token, throw error
    if (!token) {
      throw new Error();
    }

    const secretKey = process.env.SECRET_KEY;

    //verify token
    const payload = jwt.verify(token, secretKey);

    //find user using email from payload
    // const user = await User.findOne({
    //   email: payload.email,
    // });
    const user = await User.findOne({ where: { email: payload.email } });

    //if not user found, throw error
    if (!user) {
      throw new Error();
    }

    //check if user role is "seller"
    //if user role is not "seller", throw error
    if (user.role !== "seller") {
      throw new Error();
    }

    //attach user.id to req
    req.loggedInUserId = user.id;

    //call next function
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};

export const isCustomer = async (req, res, next) => {
  try {
    //extract token from req.headers
    console.log(req.headers);
    // console.log(req.headers.authorization);
    const { authorization } = req.headers;
    console.log(authorization);

    const splitArray = authorization?.split(" "); //optional chaining
    // console.log(splitArray);
    const token = splitArray?.length === 2 ? splitArray[1] : null;
    // console.log(token);

    //is not token, throw error
    if (!token) {
      throw new Error();
    }

    const secretKey = process.env.SECRET_KEY;

    //verify token
    const payload = jwt.verify(token, secretKey);
    console.log(payload);

    //find user using email from payload
    // const user = await User.findOne({
    //   email: payload.email,
    // });
    const user = await User.findOne({ where: { email: payload.email } });

    //if not user found, throw error
    if (!user) {
      throw new Error();
    }

    //check if user role is "customer"
    //if user role is not "customer", throw error
    if (payload.role !== "customer") {
      throw new Error();
    }

    //attach user.id to req
    req.loggedInUserId = user.id;

    //call next function
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized123" });
  }
};

export const isUser = async (req, res, next) => {
  try {
    //extract token from req.headers
    console.log(req.headers);
    // console.log(req.headers.authorization);
    const { authorization } = req.headers;
    console.log(authorization);

    const splitArray = authorization?.split(" "); //optional chaining
    // console.log(splitArray);
    const token = splitArray?.length === 2 ? splitArray[1] : null;
    // console.log(token);

    //is not token, throw error
    if (!token) {
      throw new Error();
    }

    const secretKey = process.env.SECRET_KEY;

    //verify token
    const payload = jwt.verify(token, secretKey);
    console.log(payload);

    //find user using email from payload
    // const user = await User.findOne({
    //   email: payload.email,
    // });
    const user = await User.findOne({
      where: { email: payload.email },
      attributes: ["id", "name", "role", "email"],
    });

    //if not user found, throw error
    if (!user) {
      throw new Error();
    }

    //attach user.id to req
    req.loggedInUserId = user.id;
    req.user = user;

    //call next function
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized123" });
  }
};
