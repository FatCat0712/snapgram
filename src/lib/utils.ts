import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const currentDate = new Date();
  const date = new Date(dateString);
  const timeDifference = Math.floor(
    (currentDate.getTime() - date.getTime()) / 1000,
  );

  if (timeDifference < 60) {
    return `${timeDifference} seconds ago`;
  } else if (timeDifference < 3600) {
    const minutes = Math.floor(timeDifference / 60);
    return `${minutes} minutes ago`;
  } else if (timeDifference < 86400) {
    const hours = Math.floor(timeDifference / 3600);
    return `${hours} hours ago`;
  } else {
    const days = Math.floor(timeDifference / 86400);
    return `${days} days ago`;
  }
}

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};
