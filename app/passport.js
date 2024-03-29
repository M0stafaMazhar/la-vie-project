const passport = require('passport')
const googleStrategy = require('passport-google-oauth20')
const facebookStrategy = require('passport-facebook')

const userModel = require('../db/models/user-model')

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user , done)=>{

    
        done(null, user)
    
})


passport.use(new googleStrategy({
    clientID: process.env.GCID ,
    clientSecret: process.env.GCS ,
    callbackURL: "/api/user/login/google-redirect",
}, async (accessToken , refreshToken , profile, done)=>{
    try{
    const user = await userModel.findOne({googleId: profile.id})
    if(user) {
        const token = await user.generateToken()
        done(null , {user , token})
    }else{
    const userData = new userModel({
        fName: profile.name.givenName,
        lName: profile.name.familyName,
        googleId : profile.id,
        email: profile.emails[0].value,
    })

    const token = await userData.generateToken()
    await userData.save()
    done(null , {userData , token})
    }
}
    catch(err){
        return done(err , null)
    }})
)


passport.use(new facebookStrategy({
    clientID: process.env.FCID ,
    clientSecret: process.env.FCS, 
    callbackURL: "/api/user/login/facebook-redirect",
    profileFields: ['id', 'displayName', 'email', 'first_name', 'middle_name', 'last_name']
}, async (accessToken , refreshToken , profile, done)=>{
    try{
    const user = await userModel.findOne({facebookId: profile.id})
    if(user) {
        const token = await user.generateToken()
        done(null , {user , token})
    }else{
    const userData = new userModel({
        fName: profile.name.givenName,
        lName: profile.name.familyName,
        facebookId : profile.id,
        email: profile.emails[0].value,
    })

    const token = await userData.generateToken()
    await userData.save()
        done(null , {userData , token})
    }
}
    catch(err){
        done(err , null)
    }})
)



module.exports = passport