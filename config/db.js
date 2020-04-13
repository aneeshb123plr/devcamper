const mongoose = require("mongoose");

const connectDB = async () => {
  const options = {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  };
  const conn = await mongoose.connect(process.env.MONGO_URI, options);

  console.log(`MongoDB connected ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
