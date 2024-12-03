require('dotenv').config();

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.use(session({
    secret: "krishna",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
    res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback", passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect("/profile");
});

app.get("/profile", (req, res) => {
    if (!req.user) {
        return res.redirect("/"); // Redirect if user is not authenticated
    }

    // Print the session data (user data) to the console
    console.log('User Data in Session:', req.user);

    // Display some basic user info on the page
    res.send(`
        <h1>Welcome, ${req.user.displayName}</h1>
        <p>Email: ${req.user.emails[0].value}</p>
        <p>Google Profile ID: ${req.user.id}</p>
        <p><a href="/logout">Logout</a></p>
    `);
});


app.get("/logout", (req, res) => {
    req.logout(()=>{
    res.redirect("/");
    });
});

app.listen(3000, () => {
    console.log("Server is running");
});
