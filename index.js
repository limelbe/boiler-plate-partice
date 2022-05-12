const express = require('express');    // 다운받은 express모듈 가져오기
const app = express();                 // express 앱 생성
const port = 5000;
const bodyParser = require('body-parser');
const config = require('./config/key')

const { User } = require('./models/User');

app.use(bodyParser.urlencoded({extened: true}));  // application/x-www-form-urlencoded 데이터를 분석해서 가져올 수 있게 해주는
app.use(bodyParser.json()); // application/json 데이터를 분석해서 가져올 수 있게 해주는



const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false
  // 몽구스 버전이 6.0이상이라면 몽구스는 항상 위에처럼 기억하고 실행해서 안써줘도됨
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요');    // localhost:5000 루트디렉토리(/)가면 출력됨
});

app.post('/register', (req, res) => {

  // 회원가입할때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어줌
  const user = new User(req.body);    // bodyParser가 client에서 보내는 정보를 req.body로 받아주는것

  user.save((err, userInfo) => { // .save() -> 몽고db 메서드 -> 받은 정보가 User model에 저장
    if(err) return res.json({ success: false, err});
    return res.status(200).json({
      success: true
    });

  }); 

});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);    // 이 앱이 5000포트에 listen하면 터미널에 콘솔 출력
});

// package.json에서 "scripts"부분에 "start": "node index.js" 추가 -> npm run start 하면 node앱을 실행 -> 시작점이 index.js
// 수정하면 서버 죽인다음에(ctrl+c) 다시 run해야 적용