module.exports = {
  definition: `
    type UserProfile {
      id: ID!
      username: String!
      email: String!
      confirmed: Boolean
      blocked: Boolean
      role: UsersPermissionsMeRole
      profile: Profile
    }
  `,
  query: `
    userProfile: UserProfile 
  `,
  mutation: `
    updateUserProfile(id: ID!, savedArticles: [ID]): UserProfile!
  `,
  resolver: {
    Query: {
      userProfile: {
        // policies: ["plugins::users-permissions.isAuthenticated", "isOwner"], // Apply the 'isAuthenticated' policy of the `Users & Permissions` plugin, then the 'isOwner' policy before executing the resolver.
        resolver: "plugins::users-permissions.user.me",
      },
    },
    Mutation: {
      updateUserProfile: {
        description: "Updates a user's profile",
        policies: ["plugins::users-permissions.isAuthenticated"],
        resolver: "application::profile.profile.update",
      },
    },
  },
};
