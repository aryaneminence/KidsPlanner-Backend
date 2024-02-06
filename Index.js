const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; 
const Connection = require('./Database')
const Payment=require('./Routes/Payment')
const {json} =require ('express');
const Profile = require('./Routes/Profile');
require('dotenv').config();
app.use(cors());
app.use(json())


// Router configuration
app.use('/',Payment);

app.use('/',Profile)


//Database Connection
Connection()
app.listen(port, function () {
  console.log(`Express Server is started at PORT http://localhost:${port}`);
});
