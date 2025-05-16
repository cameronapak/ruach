import { useAccount, useIsAuthenticated } from "jazz-react";
import { AuthButton } from "./AuthButton.tsx";
import { Form } from "./Form.tsx";
import { Logo } from "./Logo.tsx";
import VoiceRecorder from "./components/VoiceRecorder";
import VoiceMessagePlayer from "./components/VoiceMessagePlayer";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MyVoiceMessages from "./MyVoiceMessages";

function App() {
  const { me } = useAccount({ resolve: { profile: true, root: true } });

  const isAuthenticated = useIsAuthenticated();

  return (
    <BrowserRouter>
      <header>
        <nav className="container flex justify-between items-center py-3">
          <div className="flex gap-4 items-center">
            <Link to="/">Home</Link>
            <Link to="/my-messages">My Messages</Link>
          </div>
          {isAuthenticated ? (
            <span>You're logged in.</span>
          ) : (
            <span>Authenticate to share the data with another device.</span>
          )}
          <AuthButton />
        </nav>
      </header>
      <main className="container mt-16 flex flex-col gap-8">
        <Link to="/">
          <Logo />
        </Link>

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
          <Route path="/my-messages" element={<MyVoiceMessages />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
