import { NextPageContext } from 'next'
import Head from 'next/head'

interface ErrorProps {
  statusCode: number
  hasGetInitialPropsRun?: boolean
  err?: Error
}

function Error({ statusCode, err }: ErrorProps) {
  return (
    <>
      <Head>
        <title>Error - GM Finance</title>
      </Head>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          {statusCode ? `Error ${statusCode}` : 'An Error Occurred'}
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
          {statusCode === 404
            ? 'This page could not be found.'
            : 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#003366',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
