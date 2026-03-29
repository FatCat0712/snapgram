import type { Models } from "appwrite";

import { Link } from "react-router-dom";
import { Button } from "../ui/button";

type UserCardProps = {
  user: Models.Document & {
    imageUrl: string;
    name: string;
    username: string;
  };
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link
      to={`/profile/${user.$id}`}
      className="flex flex-col items-center gap-2 p-4 border border-light-4 rounded-lg"
    >
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <p className="base-medium text-light-1 line-clamp-1">{user.name}</p>
        <p className="small-regular text-light-3 line-clamp-1">
          @{user.username}
        </p>
      </div>
      <Button className="bg-primary-500">Follow</Button>
    </Link>
  );
};

export default UserCard;
