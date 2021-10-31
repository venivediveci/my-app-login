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
          // console.log('found user: ', found)
          // found user:  {
          //   _id: new ObjectId("617674b1bfe75a7883455bea"),
          //   userId: '08bdb5ce-02a3-4403-9674-850be633b97c',
          //   email: '1@1',
          //   password: '$2b$10$tKHD83k8P8zlej6eX7qSrubEo9mQSOkm.1kyz4qCTHlUGvK.H6fQq'
          // }
          throw new HttpError(403, 'Email already exists')
        }
        // create the user
        const hash = await bcrypt.hash(password, saltRounds)
        const userId = uuidv4()
        // export declare interface InsertOneResult<TSchema = Document> {
        //     /** Indicates whether this write result was acknowledged. If not, then all other members of this result will be undefined */
        //     acknowledged: boolean;
        //     /** The identifier that was inserted. If the server generated the identifier, this value will be null as the driver does not have access to that data */
        //     insertedId: InferIdType<TSchema>;
        // }
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
