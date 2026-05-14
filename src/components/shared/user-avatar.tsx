import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AppUser } from "@/types/enums";

function initials(user: Pick<AppUser, "first_name" | "last_name">) {
  return `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
}

export function UserAvatar({
  user,
  className,
}: {
  user: AppUser;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatar_url ?? undefined} alt="" />
      <AvatarFallback>{initials(user)}</AvatarFallback>
    </Avatar>
  );
}
