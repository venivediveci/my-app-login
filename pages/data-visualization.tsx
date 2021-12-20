import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

const DataVisualization: React.FC = () => {
  const [title, setTitle] = useState('Data Visualization')

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>About</h1>
      <button
        onClick={() =>
          setTitle(
            title === 'Data Visualization' ? 'Not' : 'Data Visualization'
          )
        }
      >
        change title
      </button>
      <Link href="/login">Login</Link>
      <p>Here are some description</p>
    </div>
  )
}

export default DataVisualization
