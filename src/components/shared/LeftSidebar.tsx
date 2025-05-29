import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { sidebarLinks } from "@/contants";
import { useEffect } from "react";
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useUserContext } from "@/context/AuthContext";

const LeftSidebar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img
            src={user.imageUrl || "/assets/images/profile-placeholder.svg"}
            alt="avatar"
            className="h-14 w-14 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route;
            const IconComponent = link.icon;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${
                  isActive && "bg-primary-500"
                }`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <IconComponent 
                    className={`w-5 h-5 group-hover:text-white ${
                      isActive ? "text-white" : "text-light-3"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant={"ghost"}
        className="shad-button_ghost"
        onClick={() => signOut()}
      >
        <LogOut className="w-5 h-5" />
        <p className="small-medium lg:base-medium">Sair</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;