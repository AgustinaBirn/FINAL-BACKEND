import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";

import config from "../config.js";
import {UsersManager} from "../controllers/users.manager.js";
import {isValidPassword} from "../services/utils.js";

const localStrategy = local.Strategy;
const jwtStrategy = jwt.Strategy;
const jwtExtractor = jwt.ExtractJwt;
const manager = new UsersManager();

const cookieExtractor = (req) => {
    let token = null;
    if(req && req.cookies) token = req.cookies[`cookieToken`];

    return token;
}


const initAuthStrategies = () => {
    passport.use("login", new localStrategy(
        {passReqToCallback: true, usernameField: "email"},
        async (req, username, password, done) => {
            try {
                const savedUser = await manager.findUserByEmail(username);
                if(savedUser && isValidPassword(password, savedUser.password)){
                    const { password, ...filteredSavedUser } = savedUser;
                    return done(null, filteredSavedUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }

    ));

    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL,
            // scope: ["user:email"]
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const emailsList = profile.emails || null;
                const email = profile._json?.email || null;

                if (!emailsList && !email) {
                    const response = await fetch('https://api.github.com/user/emails', {
                        headers: {
                            'Authorization': `token ${accessToken}`,
                            'User-Agent': config.APP_NAME
                        }
                    });
                    const emails = await response.json();
                    email = emails.filter(email => email.verified).map(email => ({ value: email.email }));
                }
                
                
                if (email) {
                    const foundUser = await manager.findUserByEmail(  email);

                    if (!foundUser) {
                        const user = {
                            firstName: profile._json.name.split(' ')[0],
                            lastName: profile._json.name.split(' ')[1],
                            email: email,
                            age: 25,
                            password: 'none'
                        }

                        const process = await manager.addUser(user);

                        return done(null, process);
                    } else {
                        return done(null, foundUser);
                    }
                } else {
                    return done(new Error('Faltan datos de perfil'), null);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.use("jwtlogin", new jwtStrategy(
        {
            jwtFromRequest: jwtExtractor.fromExtractors([cookieExtractor]),
            secretOrKey: config.SECRET
        },
        async (jwt_payload, done) => {
            try{
                return done(null, jwt_payload);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    })
};

export default initAuthStrategies;