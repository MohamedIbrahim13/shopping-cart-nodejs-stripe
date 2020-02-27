const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const OrderScheme= new Schema({
    user:{type:Schema.Types.ObjectId,ref:'User'},
    cart:{type:Object,required:true},
    address:{type:String,required:true},
    ccname:{type:String,required:true},
    paymentId:{type:String,required:true},
    orderTime:{type:Date,default:Date.now}
});

const Order=mongoose.model('order',OrderScheme);

module.exports=Order;