if(process.env.NODE_ENV === 'production') {   // process.env.NODE_ENV 환경변수로 판단해서 개발환경일때는 dev.js에 있는 mongouri 가져오고, 배포환경에서는 prod.js에 있는 uri씀(여기선 heroku에 배포한다고 했을때)
  module.exports = require('./prod');
} else {
  module.exports = require('./dev');
}