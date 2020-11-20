import { useQuery } from "@apollo/client";
import { USER_PROFILE } from "./";
export function useUserProfile() {
  return useQuery(USER_PROFILE);
}
