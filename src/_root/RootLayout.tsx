import { useEffect, useState } from "react";

import OrganizedSidebar from "@/components/shared/OrganizedSidebar";
import { Outlet } from "react-router-dom";
import SlideOutMenu from "@/components/shared/SlideOutMenu";
import Topbar from "@/components/shared/Topbar";

const RootLayout = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Detectar se a tela é >= 1440px para ajustar o layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1440);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className={`w-full ${isLargeScreen ? 'md:flex' : ''}`}>
      <Topbar />
      <OrganizedSidebar />

      <section className={`flex flex-1 h-full ${isLargeScreen ? '' : 'w-full'}`}>
        <Outlet />
      </section>

      <SlideOutMenu />
    </div>
  );
};

export default RootLayout;