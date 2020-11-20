import { useMutation } from "@apollo/client";
import { ADD_SAVED_ARTICLE } from "./";
export function useAddSavedArticle() {
  return useMutation(ADD_SAVED_ARTICLE);
}
