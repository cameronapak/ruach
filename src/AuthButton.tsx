"use client";

import { useAccount, usePasskeyAuth } from "jazz-react";
import { APPLICATION_NAME } from "./main";
import { Button } from "./components/ui/button";

export function AuthButton() {
  const { logOut } = useAccount();

  const auth = usePasskeyAuth({
    appName: APPLICATION_NAME,
  });

  function handleLogOut() {
    logOut();
    window.history.pushState({}, "", "/");
  }

  if (auth.state === "signedIn") {
    return (
      <Button
        variant="secondary"
        onClick={handleLogOut}
      >
        Log out
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => auth.signUp("")}
      >
        Sign up
      </Button>
      <Button
        variant="default"
        onClick={() => auth.logIn()}
      >
        Log in
      </Button>
    </div>
  );
}
