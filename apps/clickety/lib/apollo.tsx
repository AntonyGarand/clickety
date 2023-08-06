// Stolen from https://raw.githubusercontent.com/vercel/next.js/canary/examples/with-apollo/lib/apolloClient.js
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

let apolloClient: ApolloClient<true>;

function createApolloClient() {
  const authLink = setContext((_, { headers }) => {
    const token =
      typeof window !== 'undefined'
        ? window?.localStorage?.getItem('token') || ''
        : '';

    return {
      headers: {
        ...headers,
        authorization: token || '',
      },
    };
  });

  const uri =
    process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT ||
    'http://localhost:8081' + `/v1/graphql`;

  const httpLink = new HttpLink({
    uri: uri,
    fetch,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: uri.replace(/http/, 'ws'),
    })
  );

  /**
   * Use the http link for all queries which are not subscriptions for better performance
   * And use the websocket link for subscription for a persisted communication
   */
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(splitLink),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState = null): ApolloClient<true> {
  const _apolloClient = apolloClient ?? createApolloClient();

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client: any, pageProps: any) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function getApolloClient(): ApolloClient<true> {
  return initializeApollo();
}

export function useApollo() {
  const store = initializeApollo();
  return store;
}
