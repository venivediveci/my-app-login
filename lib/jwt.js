import jwt from 'jsonwebtoken'

const secret = process.env.SECRET

export const sign = (obj, options = { expiresIn: '1m' }) => {
  return new Promise((resolve, reject) => {
    jwt.sign(obj, secret, options, (err, encoded) => {
      if (err) {
        return reject(err)
      }
      resolve(encoded)
    })
  })
}

export const verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      return resolve(decoded)
    })
  })
}
