const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; 
//const Connection =require('../Onboarding/Db')
const Payment=require('./Routes/Payment')
const {json} =require ('express');
app.use(cors());
app.use(json())
// Simple request
// app.get('/', function (request, response) {
//   console.log(request);
//   response.send("<h2>Welcome to User Onboarding BoilerPlate </h2>");
// });


// Router configuration
app.use('/',Payment);



//Database Connection
//Connection()
app.listen(port, function () {
  console.log(`Express Server is started at PORT http://localhost:${port}`);
});
