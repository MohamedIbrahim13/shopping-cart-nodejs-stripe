const passport= require('passport');
const LocalStrategy =require('passport-local').Strategy;
const User =require('../models/users');

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id).then(user=>{
        done(null,user)
    });
});

passport.use('local.signup',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },(email,password,done)=>{
      User.findOne({emai:email}).then((curr)=>{
          if(curr){
              console.log(`${curr} does exist`);
              done(null,false, {message: 'Email is already in use.'});
          }else{
              let newUser = new User();
              newUser.email = email;
              newUser.password = newUser.encryptPassword(password);
              newUser.save().then((newUser)=>{
                  console.log(`${newUser} has been created`);
                  done(null,newUser);
              })
          };
      });
    
    }
));

passport.use('local.signin',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },(email,password,done)=>{
      User.findOne({ email: email },(err, user)=>{
          if (err) return done(err);
          if (!user) return done(null, false, { message: 'Incorrect username.' });
          if (!user.validPassword(password)) return done(null, false, { message: 'Incorrect password.' });
          return done(null, user);
      });
    
    }
));
