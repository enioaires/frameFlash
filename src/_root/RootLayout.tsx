import Bottombar from "@/components/shared/Bottombar";
import OrganizedSidebar from "@/components/shared/OrganizedSidebar";
import { Outlet } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <Topbar />
      <OrganizedSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;
