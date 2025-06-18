import { gql } from '@apollo/client';

export const GET_USER_INFO = gql`
  query MiniAppLogin($code: String!) {
    miniAppLogin(code: $code) {
      user {
      _id
      name
      avatar {
      path
      }
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
      isZaloActive
      isActive
      }
      accessToken
    }
  }
`;
export const GET_PROFILE = gql`
query MiniAppMe {
  miniAppMe {
    _id
    name
    email
    username
    phone
    zaloId
    password
    createdAt
    updatedAt
    isActive
    isZaloActive
    status
    type
    role
    avatar {
      path
    }
    address
    gender
    lastLoginAt
  }
}

`;
export const ACTIVE_USER = gql`
mutation MiniAppActiveZalo($data: ZaloActiveInput!) {
  miniAppActiveZalo(data: $data) {
    _id
    name
    email
    username
    phone
    zaloId
    createdAt
    updatedAt
    isActive
    isZaloActive
    status
    type
    role
    avatar {
      path
    }
    address
    gender
    lastLoginAt
  }
}
`;