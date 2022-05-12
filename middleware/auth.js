const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 인증처리를 하는 곳

  // 1. 클라이언트 쿠키에서 토큰을 가져옴
  let token = req.cookies.x_auth;

  // 2. 토큰을 복호화해서 유저를 찾음
  User.findByToken(token, (err, user) => {
    if(err) throw err;
    if(!user) return res.json({isAuth: false, error: true});

    req.token = token;
    req.user = user;  // req에 token과 user를 넣으줌으로 인해서 index.js에서 '/api/users/auth' request 받을때 req.token, req.user을 가질수 있음
    next();   // next()가 없다면 여기에 갇혀있게됨


  });

  // 3. 유저가 있으면 인증 ok


  // 4. 유저가 없으면 인증 no





}


module.exports = { auth };