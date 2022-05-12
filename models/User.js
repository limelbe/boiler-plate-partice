const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,   // 글자사이에 공백없애는 역할
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }

})

userSchema.pre('save', function( next ) {  // mongoose 메서드 -> index.js에서 user.save()하기전에 실행되는 내용
  var user = this;

  // 비밀번호 암호화
  if(user.isModified('password')) {   // 비밀번호를 바꿀때만 비밀번호를 암호화해준다 -> 이 조건문이 없으면 이름이나 다른 정보를 바꿀때도 계속 비밀번호가 암호화됨
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if(err) return next(err);
  
      bcrypt.hash(user.password, salt, function(err, hash){   // user.password -> client한테 받아서 User모델에 들어있는 비밀번호
        if(err) return next(err);
        user.password = hash;   // User모델의 비밀번호를 암호화한 비밀번호(hash)로 교체
        next();
      });
    });
  } else {
    next();
  }

});


// 비밀번호 비교 메서드 만들기
userSchema.methods.comparePassword = function(plainPassword, cb) {
  // 이미 암호화되어 DB에 저장된 비밀번호 복호화 불가 -> 로그인시 입력한 비밀번호를 암호화해서 DB에 저장된 암호화비밀번호랑 일치하는지 비교 필요
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });

}

// 토큰생성 메서드 만들기
userSchema.methods.generateToken = function(cb) {
  var user = this;

  // jsonwebtoken을 이용해서 token을 생성
  var token = jwt.sign(user._id.toHexString(), 'secretToken');
  // user._id 랑 'secretToken' 을 더해서 token을 만들고 (encode한다) 
  // 나중에 token을 해석을 할때(decode할때) 'secretToken'을 넣으면 user._id를 알수있는 -> token을 가지고 유저가 누구인지 알수있는
  // user._id -> mongoDB에서 자동으로 부여되는 ObjectId -> primary key같은 역할
  // toHexString()안하면 Error: Expected "payload" to be a plain object 에러발생

  user.token = token;
  user.save(function(err, userInfo) {
    if(err) return cb(err);
    cb(null, userInfo);
  })
}

// 토큰 복호화 메서드 만들기
userSchema.statics.findByToken = function(token, cb) {
  var user = this;

  // 토큰을 decode함
  jwt.verify(token, 'secretToken', function(err, decoded) {
    // 유저아이디를 이용해서 유저를 찾은 다음 -> 여기선 decoded가 복호화된 유저id
    // 클라이언트에서 가져온 tokenrhk db에 보관된 토큰이 일치하는지 확인
    user.findOne({"_id": decoded, "token": token}, function (err, user){
      if(err) return cb(err);
      cb(null, user);
    });
  });


}





const User = mongoose.model('User', userSchema)

module.exports = { User }   // 다른파일에서 이 model을 쓸수있게