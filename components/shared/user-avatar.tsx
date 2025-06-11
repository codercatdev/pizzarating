'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function UserAvatar({ size = 'md', showName = false }: UserAvatarProps) {
  const { user, userProfile } = useAuth();

  if (!user || !userProfile) return null;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.photoURL || undefined} alt={userProfile.displayName} />
        <AvatarFallback className={`${userProfile.avatarColor} text-white font-semibold`}>
          {getInitials(userProfile.displayName)}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{userProfile.displayName}</span>
        </div>
      )}
    </div>
  );
}
</AvatarFallback>
      </Avatar>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{userProfile.displayName}</span>
        </div>
      )}
    </div>
  );
}