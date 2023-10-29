import express from 'express';
import isEmail from 'validator/lib/isEmail.js';

const validateUser = (req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const values = ['fullName', 'username', 'password', 'birthday', 'email'];
  const user = req.body;
  const errorList: string[] = [];

  values.forEach(key => {
    if (!user[key]) {
      errorList.push(`${key} is Required!`);
    }
  });

  if (errorList.length) {
    return res.status(500).json({success: false, error: errorList});
  } 

  if (user.password?.length < 6) {
    errorList.push('Password should contain at least 6 characters!\n');
  }
  
  if (user.username?.length < 6) {
    errorList.push('Username should contain at least 6 characters!\n');
  }

  if (!isEmail.default(user.email)) {
    errorList.push('Email is not Valid\n');
  }
  
  
  if (errorList.length) {
    console.log("Something is wrong 2 :(");
    console.log(errorList);
    res.status(500).json({success: false, error: errorList});
  } else {
    next();
  }
}

const validateLogin = (req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {

  const values = ['username', 'password'];
  const user = req.body;
  const errorList: string[] = [];

  values.forEach(key => {
    if (!user[key]) {
      errorList.push(`${key} is Required!\n`);
    }
  });

  if (errorList.length) {
   return res.status(500).json({success: false, error: errorList});
  } else {
    next();
  }

}



export {
  validateUser,
  validateLogin
}