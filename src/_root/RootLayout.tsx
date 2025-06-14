import OnlineStatusTracker from "@/components/shared/OnlineStatusTracker";
import OrganizedSidebar from "@/components/shared/OrganizedSidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/shared/Topbar";
import SlideOutMenu from "@/components/shared/SlideOutMenu";
import Topbar from "@/components/shared/Topbar";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <OnlineStatusTracker />
      <div className="w-full flex flex-col h-full">
        <Topbar />
        <OrganizedSidebar />
        <div className="flex-1 overflow-hidden">
          <section className="flex flex-1 h-full w-full">
            <Outlet />
          </section>
        </div>
        <SlideOutMenu />
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;