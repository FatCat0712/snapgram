import { useUserContext } from "@/context/AuthContext";
import type { Models } from "appwrite";

import { Link } from "react-router";
import PostStats from "./PostStats";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
};

type PostDocument = Models.Document & {
  caption: string;
  imageUrl: string;
  location?: string;
  tags?: string[];
  creator: {
    $id: string;
    name: string;
    imageUrl: string;
  };
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  if (!posts) return;

  return (
    <ul className="grid-container">
      {posts.map((post) => {
        const postDoc = post as PostDocument;
        return (
          <li className="relative min-w-80 h-80" key={post.$id}>
            <Link to={`/post/${post.$id}`} className="grid-post_link">
              <img
                src={postDoc.imageUrl}
                alt={postDoc.caption}
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="grid-post_user">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={postDoc.creator.imageUrl}
                    className="h-18 w-8 rounded-full"
                  />
                  <p className="line-clamp-1">{postDoc.creator.name}</p>
                </div>
              )}
              {showStats && <PostStats post={post} userId={user.id} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;
