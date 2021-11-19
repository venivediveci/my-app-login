import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

import { sign } from '../../lib/jwt'
import dbPromise from '../../lib/mongodb'
import { HttpError } from '../../errors'

const saltRounds = 10

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
        // db
        const client = await dbPromise
        const db = client.db()
        const collection = db.collection('user')
        // check if the email already exists
        const found = await collection.findOne({ email })
        if (found) {
          throw new HttpError(403, 'Email already exists')
        }
        // create the user
        const hash = await bcrypt.hash(password, saltRounds)
        const userId = uuidv4()
        const createRes = await collection.insertOne({
          userId,
          email,
          password: hash,
        })
        if (!createRes.acknowledged) {
          throw new HttpError(500, 'create user failed')
        }
        // send the response
        const token = await sign({ userId, email })
        res.status(200).json({ token })
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
