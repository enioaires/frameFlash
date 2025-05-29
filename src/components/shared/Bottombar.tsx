import { Link, useLocation } from "react-router-dom";

import { bottombarLinks } from "@/contants";

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        const IconComponent = link.icon;

        return (
          <Link
            to={link.route}
            key={link.label}
            className={`flex-center flex-col gap-1 p-2 transition ${
              isActive && "bg-primary-500 rounded-[10px]"
            }`}
          >
            <IconComponent 
              className={`w-4 h-4 ${
                isActive ? "text-white" : "text-primary-500"
              }`}
            />
            <p className="tiny-medium text-light-2">{link.label}</p>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;