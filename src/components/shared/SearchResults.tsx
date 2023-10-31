import { Models } from "appwrite";
import { FC } from "react";
import Loader from "./Loader";
import GridPostList from "./GridPostList";

type Props = {
  isSearchFetching: boolean;
  searchedPosts: Models.DocumentList<Models.Document>;
};

const SearchResults: FC<Props> = ({ isSearchFetching, searchedPosts }) => {
  if (isSearchFetching) return <Loader />;

  if (searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  }
  return (
    <p className="text-light-4 mt-10 text-center w-full">
      Nenhum resultado encontrado
    </p>
  );
};
export default SearchResults;
