
# express-auth-route

An authentication route using [passport.js](https://www.npmjs.com/package/passport) to manage authentication through
[facebook](https://www.npmjs.com/package/passport-facebook), [google](https://www.npmjs.com/package/passport-google-oauth)
and [locally](https://www.npmjs.com/package/passport-local) managed users.

# Usage

Install direct from GitHub

    npm install git+https://github.com/steveukx/express-auth-route --save

Then add to an existing [express](https://www.npmjs.com/package/express) app as a route:


    var passport = require('passport');
    var app = require('express')();

    app.use(require('express-session')({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/auth', require('express-auth-route')(properties, User, Account));

Arguments should include:

* `properties` an object providing values for:
  
  - `auth-host` the fully qualified path to the base of this root, eg: `http://mydomain.com/auth`
  - `auth-facebook-client-id` when supplied, enables facebook support at `/facebook`
  - `auth-facebook-client-secret` from the facebook app developer page
  - `auth-google-client-id` when supplied, enables google support at `/google`
  - `auth-google-client-secret` from the google developer console

* `User` model constructor with `findById`, `findOrCreate`, `findLocal`

* `Account` model constructor with `Local(username, password)`

