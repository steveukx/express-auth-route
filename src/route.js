
module.exports = function (properties, User, Account) {

    var express = require('express');
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    // converts the complete user to just the detail that will be saved to the user session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // converts the session stored value back into a complete user object
    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err || null, user);
        })
    });

    var authenticatedRequestHandler = function (req, res, next) {
        res.redirect('/');
    };

    var app = express();

    // Facebook strategy
    if (properties['auth-facebook-client-id']) {
        passport.use(new FacebookStrategy({
            clientID: properties['auth-facebook-client-id'],
            clientSecret: properties['auth-facebook-client-secret'],
            callbackURL: properties['auth-host'] + '/facebook/callback'
        }, function (accessToken, refreshToken, profile, done) {
            User.findOrCreate('facebook', profile.id, accessToken, {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName
            }).then(function (user) {
                done(null, user);
            });
        }));

        app.get('/facebook', passport.authenticate('facebook', { scope: [] }));
        app.get('/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect: '/',
                failureRedirect: '/login'
            }));
    }
    else {
        console.log("express-auth-route: add a facebook client id to enable the facebook strategy");
    }

    // Google oAuth2 strategy
    if (properties['auth-google-client-id']) {
        passport.use(new GoogleStrategy({
                clientID: properties['auth-google-client-id'],
                clientSecret: properties['auth-google-client-secret'],
                callbackURL: properties['auth-host'] + '/google/callback'
            },
            function(accessToken, refreshToken, profile, done) {
                User.findOrCreate('google', profile.id, accessToken, {
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName
                }).then(function (user) {
                    done(null, user);
                });
            }
        ));

        app.get('/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.email' }));
        app.get('/google/callback',
            passport.authenticate('google', { failureRedirect: '/login' }),
            // Successful authentication, redirect home.
            function(req, res) {
                res.redirect('/');
            });
    }
    else {
        console.log("express-auth-route: add a google client id to enable the google strategy");
    }


    // local strategy (username & password)
    passport.use(new (require('passport-local').Strategy)(
        function(username, password, done) {
            User.findLocal(username, password, function (err, user) {
                done(null, user || false, err && {message: err});
            });
        }
    ));

    app.get('/logout',
        function (req, res) {
            req.session.logout();
            res.redirect(properties['auth-logout-url'] || '/')
        });

    app.post('/login',
        require('body-parser').urlencoded({extended: false}),
        passport.authenticate('local', { failureRedirect: '/login' }),
        authenticatedRequestHandler);

    app.post('/register',
        require('body-parser').urlencoded({extended: false}),
        function (req, res, next) {
            new User({
                accounts: [Account.Local(req.body.username, req.body.password)]
            })
            .save(function (err) {
                err ? res.redirect('/login') : next();
            });
        },
        passport.authenticate('local', { failureRedirect: '/login' }),
        authenticatedRequestHandler);

    return app;

};
