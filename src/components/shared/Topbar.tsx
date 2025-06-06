import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useEffect } from "react";
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        {/* Logo/Brand (vazio por enquanto) */}
        <div className="flex-1">
          {/* Espaço para logo se necessário */}
        </div>

        {/* Navigation Actions */}
        <div className="flex gap-3 items-center">
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* Sign Out Button */}
          <Button
            variant={"ghost"}
            className="shad-button_ghost"
            onClick={() => signOut()}
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          
          {/* Profile Link */}
          <Link 
            to={`/profile/${user.id}`} 
            className="flex-center gap-3 hover:opacity-80 transition-opacity"
            title={`Perfil de ${user.name}`}
          >
            <img
              src={user.imageUrl || "/assets/images/profile-placeholder.svg"}
              alt={`Avatar de ${user.name}`}
              className="h-8 w-8 rounded-full object-cover border border-dark-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;