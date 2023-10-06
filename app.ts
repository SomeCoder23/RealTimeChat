import './config.js';
import express from 'express';
import db from './db/dataSource.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';
import cookieParser from 'cookie-parser';

var app = express();
const PORT = 5000;
app.use(express.json());
app.use(cookieParser());

  app.use('/users', usersRouter);
  app.use('/chat', chatRouter);

app.get('/', (req, res) =>{
  res.send("Welcome to the Real-Time Chat App!");
});

app.get('/health', (req, res) =>{
  res.status(200).send("Everything Good :)");
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
    db.initialize();
  });

  export default app;