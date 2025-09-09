const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { user } = require("../controllers/auth-controller");
const userSchema = new mongoose.Schema({
  anon_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    user_ref: {
      type: String, // assuming this links to MySQL user_id
      default: null,
    },
    // keeping password for hashing/login like user model
    password: { type: String, required: true },
}, { timestamps: true });

userSchema.pre("save",async function(next){
    // console.log("inside this",this);
    let user = this;
    if(!user.isModified("password")){
        next();
    }
    try {
        const saltRounds = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(user.password,saltRounds)
        user.password=hash_password;

    } catch (error) {
        console.log("Error from pre method",error);
        
    }
    
})

userSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                anon_id: this._id.toString(),
                nickname: this.nickname,
                isAdmin:this.isAdmin
            },
            process.env.JWT_KEY,
            { expiresIn: "30d" }
        );
    } catch (error) {
        console.error(error);
        throw new Error("Token generation failed");
    }
};


const User = mongoose.model("User", userSchema);

module.exports = User;
