import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) {
      navigate(0);
    }
  }, [isSuccess, navigate]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={130}
            height={325}
          />
        </Link>
        <div className="flex gap-4">
          <Link to={`/profile/${user.id}`} className="flex items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
          >
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="rotate-180"
            />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
