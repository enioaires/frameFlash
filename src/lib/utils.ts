import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const differenceInMilliseconds = now.getTime() - date.getTime();
  const differenceInSeconds = differenceInMilliseconds / 1000;
  const differenceInMinutes = differenceInSeconds / 60;
  const differenceInHours = differenceInMinutes / 60;
  const differenceInDays = differenceInHours / 24;

  if (differenceInDays >= 1) {
    return `${Math.floor(differenceInDays)} dia(s) atrás`;
  } else if (differenceInHours >= 1) {
    return `${Math.floor(differenceInHours)} hora(s) atrás`;
  } else if (differenceInMinutes >= 1) {
    return `${Math.floor(differenceInMinutes)} minuto(s) atrás`;
  } else {
    return `${Math.floor(differenceInSeconds)} segundo(s) atrás`;
  }
}

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};