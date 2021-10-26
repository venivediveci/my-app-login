const assert = require('assert')
const bcrypt = require('bcrypt')
const uuidv4 = require('uuid').v4
const jwt = require('jsonwebtoken')

console.log(process.env)

const saltRounds = 10

const client = new MongoClient(url)

function findUser(db, email, callback) {
  const collection = db.collection('user')
  collection.findOne({ email }, callback)
}

function createUser(db, email, password, callback) {
  const collection = db.collection('user')
  bcrypt.hash(password, saltRounds, function (err, hash) {
    collection.insertOne(
      { userId: uuidv4(), email, password: hash },
      function (err, userCreated) {
        assert.equal(err, null)
        callback(userCreated)
      }
    )
  })
}

const handler = (req, res) => {
  if (req.method === 'POST') {
    try {
      assert.notEqual(null, req.body.email, 'Email required')
      assert.notEqual(null, req.body.password, 'Password required')
    } catch (bodyError) {
      res.status(403).json({ error: true, message: bodyError.message })
    }

    client.connect(function (err) {
      assert.equal(null, err)
      console.log('Connected to MongoDB server =>')
      const db = client.db(dbName)
      const email = req.body.email
      const password = req.body.password

      findUser(db, email, function (err, user) {
        if (err) {
          res.status(500).json({ error: true, message: 'Error finding User' })
          return
        }

        if (!user) {
          createUser(db, email, password, function (creationResult) {
            console.log(creationResult)
            if (creationResult.ops?.length === 1) {
              const user = creationResult.ops[0]
              const token = jwt.sign(
                { userId: user.userId, email: user.email },
                jwtSecret,
                {
                  expiresIn: '1m',
                }
              )
              res.status(200).json({ token })
              return
            }
          })
        } else {
          res.status(403).json({ error: true, message: 'Email exists' })
          return
        }
      })
    })
  } else {
    res.status(200).json({ users: ['John Doe'] })
  }
}

export default handler
