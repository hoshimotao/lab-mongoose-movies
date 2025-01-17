require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session      = require('express-session');
const MongoStore   = require('connect-mongo')(session);
const flash = require('connect-flash');
const GoogleStrategy = require('passport-google-oath20').Strategy;



mongoose.Promise = Promise;
mongoose
  .connect('mongodb://localhost/starter-code', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

app.use(session({
  secret: 'secret-key',
  cookie: {maxAge: 120},
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));


app.use(flash());

app.use((req,res,next)=>{

  res.locals.theUser = req.session.currentUser;

  res.locals.errorMessage = req.flash('error', "Sorry breh, we ain't got that username")

  next();
})

passport.use(
  new SlackStrategy(
    {
      clientID: "process.env.GOOGLE_ID",
      clientSecret: "process.env.GOOGLE_SECRET",
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Slack account details:", profile);

      User.findOne({ goodleID: profile.id })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          User.create({ goodleID: profile.id })
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
);

const index = require('./routes/index');
app.use('/', index);

const celebRoutes = require('./routes/celeb-routes')
app.use('/', celebRoutes);

const movieRoutes = require('./routes/movie-routes')
app.use('/', movieRoutes);
// const movieRoutes = require('./routes/movie-routes')
// app.use('/', movieRoutes);

const userRoutes = require('./routes/user-routes')
app.use('/', userRoutes);

module.exports = app;
