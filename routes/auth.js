const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn,isNotLoggedIn} = require('./middlewares');
const {User} = require('../models');

const router = express.Router();

router.post('/join',isNotLoggedIn,async(req,res,next)=>{
    const {email,nick,password} = req.body;
    try{

        const exUser = await User.findOne({where:{email}});
        if(exUser){
            req.flash('joinError','이미 가입된 이메일입니다');
            return res.redirect('/join');
        }
            const hash = await bcrypt.hash(password,12);
            await User.create({
                email,
                nick,
                password:hash,
            });
            return res.redirect('/');
        

    }catch(error){
        console.error(error);
        return next(error);
    }
});

router.post('/login',isNotLoggedIn,(req,res,next)=>{
    passport.authenticate('local',(authError,user,info)=>{
        console.log("여기가 로그인 router");
        if(authError){
            console.log("여기가 삑2");
            console.error(authError);
            return next(authError);
        }
        if(!user){
            console.log("여기가 삑");
            req.flash('loginError',info.message);
            return res.redirect('./');
        }
        console.log("여기는 오나?")
        return req.login(user,(loginError)=>{
            // ? req.login()메서드가 passport.serializer 호출
            if(loginError){
                console.log("여기가 삑?3")
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
            // ? return res.redirect('./') 하면 404 Error가 뜬다 
        });
    })(req,res,next);
});

router.get('/logout',isLoggedIn,(req,res)=>{
    req.logout();
    req.session.destroy();
    res.redirect('./');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;