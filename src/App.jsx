import { Signup } from "./components/signup";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Login } from "./components/login";
import { Home } from "./components/home.jsx";
import { Header } from "./components/header";
import "./style/root.scss";
import { Sidebar } from "./components/sidebar";
import { News } from "./components/news.jsx";
import { Calenders } from "./components/calenders.jsx";
import { VerifyEmail } from "./components/verifyemail.jsx";
import { Footer } from "./components/footer.jsx";
import { Account } from "./components/account.jsx";
import { ForgotPassword } from "./components/forgotPassword";
import { GoogleOAuthProvider } from "@react-oauth/google";

function AppContent() {
  const location = useLocation();
  const hideSidebarRoutes = [
    "/signup",
    "/login",
    "/verify-email",
    "/account",
    "/forgot-password",
  ];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="/news" element={<News />} />
        <Route path="/calenders" element={<Calenders />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<h1>page not found</h1>} />
      </Routes>
      {shouldShowSidebar && <Sidebar />}
    </>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error(
      "Google Client ID is missing. Please add VITE_GOOGLE_CLIENT_ID to your .env file"
    );
    return <div>Error: Google Client ID missing</div>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Header />
        <AppContent />
        <Footer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
