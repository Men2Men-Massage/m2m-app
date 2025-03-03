import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css'; // Create this file for global styles

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#F5F5F5" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
