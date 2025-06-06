import OrganizedSidebar from "@/components/shared/OrganizedSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/shared/Topbar";
import SlideOutMenu from "@/components/shared/SlideOutMenu";
import Topbar from "@/components/shared/Topbar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="w-full  overflow-hidden">
        <Topbar />
        <OrganizedSidebar />

        <section className="flex flex-1 h-full w-full">
          <Outlet />
        </section>

        <SlideOutMenu />
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;