import Head from 'next/head'
import Link from 'next/link'

const About: React.FC = () => {
  return (
    <div>
      <Head>
        <title>About</title>
      </Head>
      <h1>About</h1>
      <Link href="/login">Login</Link>
    </div>
  )
}

export default About
