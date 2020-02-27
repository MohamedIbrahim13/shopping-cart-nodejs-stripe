var express = require('express');
var router = express.Router();
const Order=require('../models/newOrder');
const moment= require('moment');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const passport=require('passport');
const Product=require('../models/product');
const Cart = require('../models/cart');
const authCheck=(req,res,next)=>{
  if(!req.user){
    res.redirect('/login');
  }else{
    next();
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find().then(products=>{
    let cart= new Cart(req.session.cart);
    res.render('index', { products:products,user:req.user,totalQty:cart.totalQty})
  });
});


router.get('/add-to-cart/:id', function(req, res, next) {
  
  let productId= req.params.id;
  let cart= new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId,(err,product)=>{
    if(err){
      return res.redirect('/');
    }
    cart.add(product,product.id);
    req.session.cart=cart;
    console.log(req.session.cart);
    // console.log(req.session.cart.items);
    res.redirect('/');
  })

  
});




router.get('/your-cart-info', function(req, res, next) {
  
  if(!req.session.cart){
    return res.render('orders',{products:null});
  }
  let cart= new Cart(req.session.cart);
  // console.log(cart.generateArray());
  res.render('orders',{title: "Your Cart Info",products:cart.generateArray(),totalPrice:cart.totalPrice,moment:moment,user:req.user,totalQty:cart.totalQty})

  
});

router.get('/reduce/:id', function(req, res, next) {
  
  let productId= req.params.id;
  let cart= new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceItem(productId);
  req.session.cart=cart;
  res.redirect('/your-cart-info');

  
});

router.get('/remove/:id', function(req, res, next) {
  
  let productId= req.params.id;
  let cart= new Cart(req.session.cart ? req.session.cart : {});
  cart.removeAll(productId);
  req.session.cart=cart;
  res.redirect('/your-cart-info');

  
});

router.get('/checkout',authCheck,(req,res,next)=>{
  if(!req.session.cart){
    return res.redirect('/your-cart-info');
  };
  let cart= new Cart(req.session.cart);
  res.render('checkout',{user:req.user,totalPrice:cart.totalPrice,totalQty:cart.totalQty})

});

router.post('/checkout',authCheck,(req,res,next)=>{
  if(!req.session.cart){
    return res.redirect('/your-cart-info');
  };
  let cart= new Cart(req.session.cart);
  const stripe = require('stripe')('sk_test_DRQy90i6Kw8gs2oj3AaGhak700PD2avYYd');
  stripe.charges.create(
    {
      amount: cart.totalPrice * 100,
      currency: 'usd',
      source: 'tok_amex',
      description: 'My First Test Charge',
    },
    (err, charge)=>{
      // asynchronously called
      if(err){
        req.flash('error',err.message);
        console.log(err.message);
        return res.redirect('/checkout');
      }
      let order = new Order({
        user:req.user,
        cart:cart,
        address:req.body.address,
        ccname:req.body.ccname,
        paymentId:charge.id
      });
      order.save((err,result)=>{
        req.flash('success','Your order has been submitted');
        req.session.cart={};
        console.log(req.session.cart);
        res.redirect('/');
      });
    }
  );

  
});


router.post('/', function(req, res, next) {
  // res.render('index', { title: "Shopping App" });
  Order.create(req.body).then(order=>res.render('index', { title: "Shopping App",user:req.user}));
});


//users


router.get('/signup', csrfProtection, function(req, res, next) {
  let messages=req.flash('error');
  res.render('signup',{csrfToken:req.csrfToken(),messages:messages});
});

router.post('/signup',passport.authenticate('local.signup',{ successRedirect: '/profile',failureRedirect: '/signup',failureFlash: true }));


router.get('/login',csrfProtection, function(req, res, next) {
  let messages=req.flash('error');
  res.render('login',{csrfToken:req.csrfToken(),messages:messages});
  
});

router.post('/login',passport.authenticate('local.signin',{ successRedirect: '/',failureRedirect: '/login',failureFlash: true }));
router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

router.get('/profile',authCheck, (req, res) => {
  let cart= new Cart(req.session.cart);
  Order.find({user:req.user}).then(orders=>{
    orders.forEach(order=>{
      let previousOrders = new Cart(order.cart);
      order.items=previousOrders.generateArray();
    });
    res.render('profile', { title: "Profile",orders:orders,moment:moment,user:req.user,totalQty:cart.totalQty})
  });
  // res.render('profile',{ title: "Profile",user:req.user,totalQty:cart.totalQty});
});

module.exports = router;

