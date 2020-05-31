const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: Schema.Types.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const objArray = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log("Rating" + JSON.stringify(objArray[0]));
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: objArray[0].averageRating,
    });
  } catch (err) {
    console.log(err);
  }
};

ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});
ReviewSchema.post("findByIdAndUpdate", function () {
  console.log("Aneesh");
  this.constructor.getAverageRating(this.bootcamp);
});
ReviewSchema.pre("remove", function (next) {
  this.constructor.getAverageRating(this.bootcamp);
  next();
});
// User can give one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
module.exports = mongoose.model("Review", ReviewSchema);
