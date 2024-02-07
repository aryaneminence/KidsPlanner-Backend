const mongoose = require("mongoose");

const connectDatabase = () => {
  try {
    const conn= mongoose.connect(process.env.MONGO_DB_CLOUD_URL);
    console.log("Database Connected Successfully");
} catch (error) {
    console.log({error});
}
};

module.exports = connectDatabase;