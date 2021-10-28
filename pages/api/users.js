import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

import dbPromise from '../../lib/mongodb'
import { HttpError } from '../../errors'

const saltRounds = 10

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

/**
 * POST: create new user
 */
const handler = async (req, res) => {
  const { method } = req

  try {
    switch (method) {
      case 'POST':
        // check the req param if it is ok
        const { email, password } = req.body
        if (!email || !password) {
          throw new HttpError(403, 'Invalid email or password')
        }
        // create the user
        const client = await dbPromise
        const db = client.db()
        const collection = db.collection('user')
        const hash = await bcrypt.hash(password, saltRounds)
        const a = await collection.insertOne({
          userId: uuidv4(),
          email,
          password: hash,
        })
        console.log(a)
        // send the response
        res.break
      default:
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    const { statusCode = 500, message } = error
    res.status(statusCode).end(message)
  }
}

export default handler

// if (req.method === 'POST') {
//   try {
//     assert.notEqual(null, req.body.email, 'Email required')
//     assert.notEqual(null, req.body.password, 'Password required')
//   } catch (bodyError) {
//     res.status(403).json({ error: true, message: bodyError.message })
//   }

//   client.connect(function (err) {
//     assert.equal(null, err)
//     console.log('Connected to MongoDB server =>')
//     const db = client.db(dbName)
//     const email = req.body.email
//     const password = req.body.password

//     findUser(db, email, function (err, user) {
//       if (err) {
//         res.status(500).json({ error: true, message: 'Error finding User' })
//         return
//       }

//       if (!user) {
//         createUser(db, email, password, function (creationResult) {
//           console.log(creationResult)
//           if (creationResult.ops?.length === 1) {
//             const user = creationResult.ops[0]
//             const token = jwt.sign(
//               { userId: user.userId, email: user.email },
//               jwtSecret,
//               {
//                 expiresIn: '1m',
//               }
//             )
//             res.status(200).json({ token })
//             return
//           }
//         })
//       } else {
//         res.status(403).json({ error: true, message: 'Email exists' })
//         return
//       }
//     })
//   })
// } else {
//   res.status(200).json({ users: ['John Doe'] })
// }
