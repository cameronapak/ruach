import { AuthButton } from "./AuthButton.tsx";
import { Form } from "./Form.tsx";
import VoiceRecorder from "./components/VoiceRecorder";
import VoiceMessagePlayer from "./components/VoiceMessagePlayer";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MyVoiceMessages from "./MyVoiceMessages";
import { Button } from "./components/ui/button.tsx";

function App() {

  return (
    <BrowserRouter>
      <header>
        <nav className="container max-w-lg mx-auto flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/account">
              <Button variant="ghost">Account</Button>
            </Link>
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
