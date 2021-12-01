import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

const About: React.FC = () => {
  const [title, setTitle] = useState('About')
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>About</h1>
      <button onClick={() => setTitle(title === 'About' ? 'Not' : 'About')}>
        change title
      </button>
      <Link href="/login">Login</Link>
    </div>
  )
}

export default About
