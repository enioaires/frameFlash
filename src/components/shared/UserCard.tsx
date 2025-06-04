import { Crown } from 'lucide-react';
import { Link } from "react-router-dom";
import { Models } from "appwrite";
import { OnlineIndicator } from './OnlineIndicator';
import { UserOnlineStatus } from './UserOnlineStatus';

type UserCardProps = {
  user: Models.Document;
  showOnlineStatus?: boolean;
  showDetailedStatus?: boolean;
};

const UserCard = ({ 
  user, 
  showOnlineStatus = true, 
  showDetailedStatus = false 
}: UserCardProps) => {
  return (
    <Link to={`/profile/${user.$id}`} className="user-card group">
      <div className="relative">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-14 h-14"
        />
        
        {/* Indicador online */}
        {showOnlineStatus && (
          <OnlineIndicator
            lastSeen={user.lastSeen}
            size="md"
            position="bottom-right"
          />
        )}
      </div>

      <div className="flex-center flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="base-medium text-light-1 text-center line-clamp-1">
            {user.name}
          </p>
          {user.role === 'admin' && (
            <Crown className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
        
        {/* Status online detalhado */}
        {showOnlineStatus && (
          <UserOnlineStatus
            lastSeen={user.lastSeen}
            variant={showDetailedStatus ? "badge" : "compact"}
          />
        )}
      </div>
    </Link>
  );
};

export default UserCard;