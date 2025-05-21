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
  useNavigate,
} from "react-router-dom";
import MyVoiceMessages from "./MyVoiceMessages";
import { Button } from "./components/ui/button.tsx";
import { useAcceptInvite } from "jazz-react";
import { VoiceMessage } from "./schema";

function Header() {
  const location = useLocation();
  return (
    <header>
      <nav className="container max-w-lg mx-auto flex justify-between items-center py-3">
        <div className="flex items-center">
          <Link to="/" title="Home">
            <Button
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="icon"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.1049 1.10706C10.3752 0.964313 9.62477 0.964313 8.89514 1.10706C7.86166 1.30925 6.92036 1.89291 5.39024 2.84167L5.12937 3.00337C3.7497 3.85819 2.90059 4.38429 2.29356 5.12696C1.86443 5.65199 1.53192 6.24879 1.31145 6.88967C0.999589 7.79621 0.999751 8.79381 1.00002 10.4147L1.00003 15.1145C1.00003 17.2604 2.74272 19 4.89244 19C6.60818 19 7.99907 17.6116 7.99907 15.8989V13.6765C7.99907 12.5734 8.89491 11.6791 10 11.6791C11.1051 11.6791 12.0009 12.5734 12.0009 13.6765V15.8989C12.0009 17.6116 13.3918 19 15.1076 19C17.2573 19 19 17.2604 19 15.1145L19 10.4148C19.0002 8.79381 19.0004 7.79621 18.6885 6.88967C18.4681 6.24879 18.1356 5.65199 17.7064 5.12696C17.0994 4.38429 16.2503 3.85819 14.8706 3.00336L14.6098 2.84167C13.0796 1.89291 12.1383 1.30925 11.1049 1.10706Z"
                  fill="currentColor"
                ></path>
              </svg>
            </Button>
          </Link>
          <Link to="/account" title="Account">
            <Button
              variant={location.pathname === "/account" ? "secondary" : "ghost"}
              size="icon"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.25 4.3038C5.25 1.83479 7.47385 0 10 0C12.5261 0 14.75 1.83479 14.75 4.3038C14.75 6.77281 12.5261 8.6076 10 8.6076C7.47385 8.6076 5.25 6.77281 5.25 4.3038Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M3.78199 19.9879C3.89067 20 4.01982 20 4.27814 20H15.7219C15.9802 20 16.1093 20 16.218 19.9879C17.15 19.8844 17.8859 19.1392 17.9881 18.1954C18 18.0854 18 17.9546 18 17.693V17.1829C18 15.0887 16.9238 13.1455 15.1592 12.0535C11.992 10.0935 8.00799 10.0935 4.84083 12.0535C3.07623 13.1455 2 15.0887 2 17.1829V17.693C2 17.9546 2 18.0854 2.01192 18.1954C2.11412 19.1392 2.85001 19.8844 3.78199 19.9879Z"
                  fill="currentColor"
                ></path>
              </svg>
            </Button>
          </Link>
        </div>
        <AuthButton />
      </nav>
    </header>
  );
}

function InvitePage() {
  return <p>Accepting invite...</p>;
}

function InviteHandler() {
  const navigate = useNavigate();

  useAcceptInvite({
    invitedObjectSchema: VoiceMessage,
    onAccept: (messageId) => {
      console.log("messageId", messageId);
      navigate(`/message/${messageId}`);
    },
  });

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <InviteHandler />
      <main className="container max-w-lg mx-auto py-12 flex flex-col gap-8">
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
          <Route path="/invite/*" element={<InvitePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
