import { UserRound } from "lucide-react";

import { withBasePath } from "@/lib/app-paths";

type UserAvatarProps = {
  name: string;
  avatarPath?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  iconSize?: number;
};

export function UserAvatar({
  name,
  avatarPath,
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  iconSize = 18,
}: UserAvatarProps) {
  const sharedClassName = `flex items-center justify-center overflow-hidden rounded-full ${className}`.trim();

  if (avatarPath) {
    return (
      <img
        src={withBasePath(avatarPath)}
        alt={name}
        className={`${sharedClassName} object-cover ${imageClassName}`.trim()}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sharedClassName} bg-white/[0.04] text-text-muted ${fallbackClassName}`.trim()}
    >
      <UserRound size={iconSize} />
    </div>
  );
}
