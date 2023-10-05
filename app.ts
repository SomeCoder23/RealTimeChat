import './config.js';
import express from 'express';
import db from './db/dataSource.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';
var app = express();
const PORT = 5000;
app.use(express.json());

  app.use('/users', usersRouter);
  app.use('/chat', chatRouter);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
    db.initialize();
  });

  export default app;