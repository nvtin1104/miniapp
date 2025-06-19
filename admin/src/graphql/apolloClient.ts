// src/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

const client = new ApolloClient({
  link: httpLink,
  credentials: 'include',
  cache: new InMemoryCache(),
});

export default client;
