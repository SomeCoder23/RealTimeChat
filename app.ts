import express from 'express';
import db from './db/dataSource.js';

var app = express();
const PORT = 5000;
app.use(express.json());

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
    db.initialize();
  });

//app.use
  export default app;