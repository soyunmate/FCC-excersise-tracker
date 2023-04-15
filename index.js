const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];
const excersises = [];
// body parser
app.use('/api', bodyParser.urlencoded({extended: false}))

app.post('/api/users', function(req,res) {
  const _id = new Date()
  .toISOString()
  .replaceAll("-", "")
  .replaceAll(":", "")
  .replaceAll(".", "");
  const newUser = {
    "username": req.body.username,
    "_id": _id
  }
  users.push(newUser)
  res.send(newUser);
}) 

app.get('/api/users', function(req,res) {
  const allUsers = [...users];
  res.send(allUsers)
})

app.post('/api/users/:_id/exercises', function(req,res) {
  const _id = req.params._id;
  const allUsers = [...users];
  const myUser = allUsers.find(obj => obj._id === _id);
  const username = myUser.username;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = req.body.date
  let finalDate;
  if (date === "" || date === undefined || date === null) {
    finalDate = new Date().toDateString()
  } else {
    const subdate = new Date(date);
    finalDate = subdate.toDateString();
  }

  const updatedUser = {
    username: username,
    description: description,
    duration: duration,
    date: finalDate,
    _id: _id
  }

  excersises.push(updatedUser);
  res.send(updatedUser);
  
})

app.get('/api/users/:_id/logs', function(req,res) {
  const _id = req.params._id
  const log = excersises.filter(obj => obj._id === _id);
  const finalLog = log.map(obj => {
    return {
      description: obj.description,
      duration: obj.duration,
      date: obj.date
    }
  });

  const queryFrom = new Date(req.query.from).getTime();
  const queryTo = new Date(req.query.to).getTime();
  const limit = req.query.limit ? req.query.limit : 10000
  
  let sendLog;
  let subLog;
  if(req.query.from !== undefined) {
   subLog = finalLog.filter(obj => {
     const dateTime = new Date(obj.date).getTime();
     return dateTime >= queryFrom && dateTime <= queryTo
   })
    sendLog = [...subLog.filter((obj,i) => i < limit)]
  } 
  if(req.query.from === undefined) {
    const queryLog = finalLog.filter((obj,i) => i < limit);
    sendLog = [...queryLog]
  }

  const curUser = users.find(obj => obj._id === _id)
  const fullUser = {
    username: curUser.username,
    count: log.length,
    _id: _id,
    log: sendLog
  }
  console.log(fullUser)
  res.send(fullUser)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
