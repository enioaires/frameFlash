import OrganizedSidebar from "@/components/shared/OrganizedSidebar";
import { Outlet } from "react-router-dom";
import SlideOutMenu from "@/components/shared/SlideOutMenu";
import Topbar from "@/components/shared/Topbar";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <Topbar />
      <OrganizedSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <SlideOutMenu  />
    </div>
  );
};

export default RootLayout;
