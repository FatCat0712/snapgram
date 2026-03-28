import { useUserContext } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import type { Models } from "appwrite";

import { Link } from "react-router";

type postCardProps = {
  post: Models.Document & {
    caption?: string;
    location?: string;
    tags?: string[];
    imageUrl?: string;
    creator?: string;
  };
};

const PostCard = ({ post }: postCardProps) => {
  const { user } = useUserContext();

  if (!post.creator) return;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${user.id}`} className="font-medium">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              className="rounded-full w-12 lg:h-12"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">{user.name}</p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {formatDate(post.$createdAt)}
              </p>
              -
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>
        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== post.creator ? "hidden" : ""}`}
        >
          <img
            src="/assets/icons/edit.svg"
            alt="Edit Post"
            width={20}
            height={20}
          />
        </Link>
      </div>
      <Link to={`/post/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul>
            {post.tags?.map((tag, index) => (
              <li key={index} className="text-light-3">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="Post Image"
          className="post-card_img"
        />
      </Link>
    </div>
  );
};

export default PostCard;
