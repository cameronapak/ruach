import { AuthButton } from "./AuthButton.tsx";
import { Form } from "./Form.tsx";
import VoiceRecorder from "./components/VoiceRecorder";
import VoiceMessagePlayer from "./components/VoiceMessagePlayer";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import MyVoiceMessages from "./MyVoiceMessages";
import { Button } from "./components/ui/button.tsx";

function Header() {
  const location = useLocation();
  return (
    <header>
      <nav className="container max-w-lg mx-auto flex justify-between items-center py-3">
        <div className="flex items-center">
          <Link to="/">
            <Button variant={location.pathname === "/" ? "outline" : "ghost"}>
              Home
            </Button>
          </Link>
          <Link to="/account">
            <Button
              variant={location.pathname === "/account" ? "outline" : "ghost"}
            >
              Account
            </Button>
          </Link>
        </div>
        <AuthButton />
      </nav>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="container py-12 flex flex-col gap-8">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <VoiceRecorder />
                <MyVoiceMessages />
              </>
            }
          />
          <Route path="/account" element={<Form />} />
          <Route path="/message/:id" element={<VoiceMessagePlayer />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
