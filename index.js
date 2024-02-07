require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Payment=require('./routes/Payment');
const Profile = require('./routes/Profile');
const connectDatabase = require('./db/DataBase')
const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;
if (process.env.PORT) {
    port = +process.env.PORT;
}

// Router configuration
app.use('/api/payment',Payment);

app.use('/api/profile',Profile)


app.listen(port,()=>{
  connectDatabase()
  console.log(`Express Server is started at PORT: ${port}`);
});
