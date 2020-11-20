import { gql } from "@apollo/client";

export const USER_PROFILE = gql`
  query {
    userProfile {
      profile {
        id
        savedArticles {
          id
          title
        }
      }
    }
  }
`;

// there aren't proper isOwner permissions on this
export const UPDATE_USER_PROFILE = gql`
  mutation($id: ID!, $savedArticles: [ID]) {
    updateProfile(
      input: { where: { id: $id }, data: { savedArticles: $savedArticles } }
    ) {
      profile {
        id
        updated_at
        savedArticles {
          id
        }
      }
    }
  }
`;

// this is a custom resolver and it's not workin'
export const ADD_SAVED_ARTICLE = gql`
  mutation($savedArticles: [ID]) {
    updateUserProfile(input: { data: { savedArticles: $savedArticles } }) {
      profile {
        savedArticles {
          id
        }
      }
    }
  }
`;
