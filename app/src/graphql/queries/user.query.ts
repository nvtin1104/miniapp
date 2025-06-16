import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser {
    user {
      id
      name
      email
    }
  }
`;
export const GET_USER_INFO = gql`
  query ZaloMe($code: String!) {
    zaloMe(code: $code) {
      _id
      name
      isActive
      status
      type
      role
      address
      gender
      lastLoginAt
      email
      username
      phone
      zaloId
      password
      createdAt
      updatedAt
    }
  }
`;
export const GET_PROFILE = gql`
 query Query {
  getProfile
}
`;