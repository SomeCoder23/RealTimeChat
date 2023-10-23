import express from 'express';

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
    return next({
      code: "INVALID_INPUT",
      message: errorList.join(' ')
    });
  } 

  if (user.password?.length < 6) {
    errorList.push('Password should contain at least 6 characters!');
  }
  
  if (user.username?.length < 6) {
    errorList.push('Username should contain at least 6 characters!');
  }
  
//   if (!['employee', 'employer'].includes(user.type)) {
  //     errorList.push('User type unknown!');
  //   }
  
  if (errorList.length) {
    console.log("Something is wrong 2 :(");
    console.log(errorList);
    res.status(500).send(errorList);
    next({
      code: "INVALID_INPUT",
      message: errorList.join(', ')
    });
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
      errorList.push(`${key} is Required!`);
    }
  });

  if (errorList.length) {
    next({
      code: "INVALID_INPUT",
      message: errorList.join(', ')
    });
  } else {
    next();
  }

}



export {
  validateUser,
  validateLogin
}