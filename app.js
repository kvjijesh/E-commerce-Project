const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
require('dotenv').config()
const dbConnect=require('./config/dbConnect');
dbConnect();
const nocache= require('nocache')
const nodemailer=require('nodemailer')
const hbs=require('hbs')
const cors=require('cors')
const Razorpay = require('razorpay');

const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials('views',path.join(__dirname,'views'))

app.use(logger('dev'));
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:process.env.SESSION_SECRET,resave:true,saveUninitialized:false}))
app.use(nocache());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
const PORT=process.env.PORT||4000
app.listen(PORT,()=>{
  console.log(`listening on port ` +PORT)
})
