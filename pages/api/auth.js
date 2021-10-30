const clientPromise = require('../../lib/mongodb')
import { sign } from '../../lib/jwt'
const assert = require('assert')

function findUser(email, callback) {
  const collection = db.collection('user')
  collection.findOne({ email }, callback)
}

function authUser(password, hash, callback) {
  bcrypt.compare(password, hash, callback)
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      assert.notEqual(null, req.body.email, 'Email required')
      assert.notEqual(null, req.body.password, 'Password required')
    } catch (bodyError) {
      res.status(403).send(bodyError.message)
    }

    const client = await clientPromise
    const db = client.db() // will be the default database passed in the MONGODB_URI

    const email = req.body.email
    const password = req.body.password

    findUser(db, email, function (err, user) {
      if (err) {
        res.status(500).json({ error: true, message: 'Error finding User' })
        return
      }
      if (!user) {
        res.status(404).json({ error: true, message: 'User not found' })
      } else {
        authUser(
          db,
          email,
          password,
          user.password,
          async function (err, match) {
            if (err) {
              res.status(500).json({ error: true, message: 'Auth Failed' })
            }
            if (match) {
              const token = await sign({ userId, email })
              res.status(200).json({ token })
              return
            } else {
              res.status(401).json({ error: true, message: 'Auth Failed' })
            }
          }
        )
      }
    })
  } else {
    res.statusCode = 401
    res.end()
  }
}

export default handler
