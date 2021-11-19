import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import Cookies from 'js-cookie'

const Login: FC = () => {
  const [loginError, setLoginError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  function handlSubmit(e) {
    e.preventDefault()
    fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.error) {
          setLoginError(data.message)
        }
        if (data && data.token) {
          Cookies.set('token', data.token, { expires: 2 })
          router.push('/')
        }
      })
  }

  return (
    <form onSubmit={handlSubmit}>
      <p>Login</p>
      <input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input type="submit" value="Submit" />
      {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
    </form>
  )
}

export default Login
