import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { sidebarLinks } from "@/constants";
import type { INavLink } from "@/types";

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { mutate: signOut } = useSignOutAccount();
  const { user, setIsAuthenticated } = useUserContext();
  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>
        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img
            src={user.imageUrl || "/assets/icons/profile.svg"}
            alt="profile"
            className="h-14 w-14 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>
        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return (
              <li
                key={link.route}
                className={`leftsidebar-link group ${isActive ? "bg-primary-500" : ""}`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${isActive ? "invert-white" : ""}`}
                  />
                  <span className="base-regular">{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={() => {
          signOut();
          localStorage.removeItem("cookieFallback");
          setIsAuthenticated(false);
        }}
      >
        <img
          src="/assets/icons/logout.svg"
          alt="logout"
          className="rotate-180"
        />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
