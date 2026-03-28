import { getRelationshipId } from "@/lib/appwrite/api";
import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import type { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";

type PostStatsProps = {
  post: Models.Document & { likes?: Array<string | Models.Document> };
  userId: string;
};

type SavedPostRecord = Models.Document & {
  post?: Models.Document;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const likesList = Array.isArray(post.likes)
    ? post.likes
        .map(getRelationshipId)
        .filter((id): id is string => id !== null)
    : [];
  const [likes, setLikes] = useState(likesList);
  const [isSaved, setIsSaved] = useState(
    likesList.some((id) => id === userId) || false,
  );

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSavedPost } =
    useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();
  const savePostRecord = currentUser?.savedPosts?.find(
    (record: SavedPostRecord) => record.post?.$id === post.$id,
  );

  useEffect(() => {
    setIsSaved(Boolean(savePostRecord));
  }, [savePostRecord]);

  const handleLikePost = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    let newLikes = [...likes];

    const hasLiked = newLikes.includes(userId);
    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);
    likePost({ postId: post.$id, likesArray: newLikes });
  };

  const handleSavePost = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();

    if (savePostRecord) {
      setIsSaved(false);
      deleteSavedPost(savePostRecord.$id);
      return;
    }

    savePost({ postId: post.$id, userId });
    setIsSaved(true);
  };

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5">
        <img
          src={`/assets/icons/like${checkIsLiked(likes, userId) ? "d" : ""}.svg`}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />

        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        {isSavingPost || isDeletingSavedPost ? (
          <Loader />
        ) : (
          <img
            src={`/assets/icons/save${isSaved ? "d" : ""}.svg`}
            alt="save"
            width={20}
            height={20}
            onClick={handleSavePost}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
