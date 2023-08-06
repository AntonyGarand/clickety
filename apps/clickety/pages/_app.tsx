// import { ApolloProvider } from '@apollo/client';
import Head from 'next/head';

// import { useApollo } from '../lib/apollo';
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  // const apolloClient = useApollo();

  return (
    // <ApolloProvider client={apolloClient}>
    <>
      <Head>
        <title>Clickety</title>
        <meta name="description" content="Stuff" />
        <link href="global.css" rel="stylesheet" />
      </Head>

      <Component {...pageProps} />
    </>
    // </ApolloProvider>
  );
}
