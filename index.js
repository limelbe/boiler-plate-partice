const express = require('express');    // 다운받은 express모듈 가져오기
const app = express();                 // express 앱 생성
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

app.use(bodyParser.urlencoded({extened: true}));  // application/x-www-form-urlencoded 데이터를 분석해서 가져올 수 있게 해주는
app.use(bodyParser.json()); // application/json 데이터를 분석해서 가져올 수 있게 해주는
app.use(cookieParser());  // token을 cookie에 저장하기 위해 express에서 제공하는 cookieparser 사용


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false
  // 몽구스 버전이 6.0이상이라면 몽구스는 항상 위에처럼 기억하고 실행해서 안써줘도됨
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


// root route
app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요');    // localhost:5000 루트디렉토리(/)가면 출력됨
});

// register route
app.post('/api/users/register', (req, res) => {

  // 회원가입할때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어줌
  const user = new User(req.body);    // bodyParser가 client에서 보내는 정보를 req.body로 받아주는것

  user.save((err, userInfo) => { // .save() -> mongoDB 메서드 -> 받은 정보가 User model에 저장
    if(err) return res.json({ success: false, err});
    return res.status(200).json({
      success: true
    });
  }); 
});

// login route
app.post('/api/users/login', (req, res) => {

  // 1. 요청된 이메일을 데이터베이스에서 있는지 찾기
  User.findOne({ email: req.body.email }, (err, user) => {  // .findOne() -> mongoDB 메서드
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "입력된 이메일에 해당하는 유저가 없습니다."
      });
    }

    // 2. 요청된 이메일이 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {   // 내가 만든 메서드
      if(!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다."
        })
      }

      // 3. 비밀번호도 맞다면 토큰을 생성
      user.generateToken((err, user) => {   // 내가 만든 메서드
        if(err) return res.status(400).send(err);
        
        // 토큰을 저장 -> 쿠키 or 로컬스토리지 or 세션 or ... -> 각 장단점이 있는데 여기서는 쿠키에 저장하는 방법으로 진행
        res.cookie('x_auth', user.token)
          .status(200)
          .json({
            loginSuccess: true,
            userId: user._id
          });

      });
    });
  });
});

// auth route
app.get('/api/users/auth', auth, (req, res) => {    // auth : 미들웨어 -> request받은 다음 콜백함수 하기전에 중간에서 뭘 해주는

  // 지금 이 라인까지 왔다는 말음 미들웨어(auth)를 통과헀다는 것 -> Authentication이 true라는 말
  res.status(200)
    .json({
      _id: req.user._id,    // 미들웨어에서 req에 user정보 넣었기때문에 req.user._id를 쓸수있음
      isAdmin: req.user.role == 0 ? false: true,     // 0: 일반유저, !0: 관리자로 가정
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image
    });

});

// logout route
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id: req.user._id}, {token: ''}, (err, user) => {
    if(err) return res.json({success: false, err});
    return res.status(200).send({
      success: true
    });
  });

});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);    // 이 앱이 5000포트에 listen하면 터미널에 콘솔 출력
});

// package.json에서 "scripts"부분에 "start": "node index.js" 추가 -> npm run start 하면 node앱을 실행 -> 시작점이 index.js
// 수정하면 서버 죽인다음에(ctrl+c) 다시 run해야 적용