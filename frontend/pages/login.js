import React, { useEffect, useState } from "react";
import { getStrapiURL } from "../lib/api";
import { useMutation, gql, useQuery } from "@apollo/client";
import { withApollo } from "../lib/withApollo";
import { USER_PROFILE } from "../queries";
import { useUserProfile } from "../queries/useUserProfile";

function Login() {
  const [error, setError] = useState(null);
  const createDefaultUserProfile = async () => {
    // const response = await fetch(getStrapiURL(), {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
  };
  // const LoginWithTestUser = async () => {
  //   try {
  //     const response = await fetch(getStrapiURL("/auth/local"), {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         identifier: "test@test.com",
  //         password: "test@test",
  //       }),
  //     });
  //     const data = await response.json();
  //     // Handle success.
  //     if (data.error) {
  //       console.log("u fkd it!", data.error);

  //       setError(data.message[0].messages[0].message);
  //     }
  //     console.log("Well done!", data);
  //     console.log("User profile", data.user);
  //     console.log("User token", data.jwt);
  //     if (!data.user.profile) {
  //       createDefaultUserProfile();
  //     }
  //   } catch (error) {
  //     // Handle error.
  //     setError(error);
  //     console.log("An error occurred:", error);
  //   }
  // };
  const [login, { data, error: loginError, loading }] = useMutation(gql`
    mutation {
      login(input: { identifier: "test@test.com", password: "test@test" }) {
        jwt
      }
    }
  `);
  const logout = console.log("login", data, error, loading);
  useEffect(() => {
    // Request API.
    data?.login?.jwt && localStorage.setItem("token", data.login.jwt);
  }, [data]);
  const {
    data: userData,
    error: userError,
    loading: userLoading,
  } = useUserProfile();

  return (
    <div>
      {JSON.stringify(userData)}
      <button onClick={login}>Log in with test user</button>
      {loading && "logging in ... "}
      <code>{loginError && JSON.stringify(loginError)}</code>
      <code>{error && JSON.stringify(error)}</code>
      <h1>Login?</h1>
    </div>
  );
}
export default withApollo()(Login);
