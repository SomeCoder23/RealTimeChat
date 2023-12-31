import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../db/entities/User.js';

const authenticate = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers['authorization'] || req.cookies['token'] || '';  
  let tokenIsValid;
  try {
    tokenIsValid = jwt.verify(token, process.env.SECRET_KEY || '');
  } catch (error) { console.log(error);}

  if (tokenIsValid) {
    const decoded = jwt.decode(token, { json: true });
    const user = await User.findOneBy({ username: decoded?.username || '' })
    res.locals.user = user;
    next();
  } else {
    res.status(401).send("You are Unauthorized!");
  }
}

export {
  authenticate
}