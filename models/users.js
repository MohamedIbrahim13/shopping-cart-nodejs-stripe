const mongoose = require('mongoose');
const Schema= mongoose.Schema;
const bcrypt=require('bcryptjs');

const UserScheme= new Schema({
    // firstName:{type:String,required:true,trim:true},
    // lastName:{type:String,required:true,trim:true},
    // username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    joinDate:{type:Date,default:Date.now}

});
UserScheme.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);  
  };

UserScheme.methods.validPassword=function(password){
    return bcrypt.compareSync(password,this.password);
}

const User=mongoose.model('user',UserScheme);

module.exports=User;