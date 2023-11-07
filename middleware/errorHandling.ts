import express from "express";

const error404Handler = (
  req: express.Request,
  res: express.Response,
) => {
  res.status(404).send("Invalid Request Path!");
}

export {
  error404Handler
}