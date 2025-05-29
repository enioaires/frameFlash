import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
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
        <div className="flex gap-4">
          <Button
            variant={"ghost"}
            className="shad-button_ghost"
            onClick={() => signOut()}
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={user.imageUrl || "/assets/images/profile-placeholder.svg"}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;