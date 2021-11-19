import bcrypt from 'bcrypt'

import { sign } from '../../lib/jwt'
import dbPromise from '../../lib/mongodb'
import { HttpError } from '../../errors'

/**
 * user login logic
 */
const handler = async (req, res) => {
  const { method } = req
  try {
    switch (method) {
      case 'POST':
        const { email, password } = req.body
        // check the email and password if they are ok
        if (!email || !email) {
          throw new HttpError(403, 'Invalid email or password')
        }
        // db
        const client = await dbPromise
        const db = client.db()
        const collection = db.collection('user')
        // check if user exists
        const user = await collection.findOne({ email })
        if (!user) {
          throw new HttpError(403, 'Email or password invalid')
        }
        // check password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          throw new HttpError(403, 'Email or password invalid')
        }
        // generate a jwt and send it to the client
        const token = await sign({ userId: user.userId, email })
        res.status(200).json({ token })
        break
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
