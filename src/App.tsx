import { useAccount, useIsAuthenticated } from "jazz-react";
import { AuthButton } from "./AuthButton.tsx";
import { Form } from "./Form.tsx";
import { Logo } from "./Logo.tsx";
import VoiceRecorder from "./components/VoiceRecorder";
import VoiceMessagePlayer from "./components/VoiceMessagePlayer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const { me } = useAccount({ resolve: { profile: true, root: true } });

  const isAuthenticated = useIsAuthenticated();

  return (
    <BrowserRouter>
      <header>
        <nav className="container flex justify-between items-center py-3">
          {isAuthenticated ? (
            <span>You're logged in.</span>
          ) : (
            <span>Authenticate to share the data with another device.</span>
          )}
          <AuthButton />
        </nav>
      </header>
      <main className="container mt-16 flex flex-col gap-8">
        <Logo />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="text-center">
                  <h1>
                    Welcome{me?.profile.firstName ? <>, {me?.profile.firstName}</> : ""}!
                  </h1>
                  {!!me?.root.age && (
                    <p>As of today, you are {me.root.age} years old.</p>
                  )}
                </div>
                <VoiceRecorder />
                <Form />
              </>
            }
          />
          <Route path="/message/:id" element={<VoiceMessagePlayer />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
