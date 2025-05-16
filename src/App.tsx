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
            <Link to="/account">Account</Link>
          </div>
          <AuthButton />
        </nav>
      </header>
      <main className="container mt-16 flex flex-col gap-8">
        <Routes>
          <Route path="/" element={
            <>
              <VoiceRecorder />
              <MyVoiceMessages />
            </>
          } />
          <Route path="/account" element={<Form />} />
          <Route path="/message/:id" element={<VoiceMessagePlayer />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
