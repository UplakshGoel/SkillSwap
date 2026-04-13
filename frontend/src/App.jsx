import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProject from "./pages/EditProject";
import ViewProject from "./pages/ViewProject";
import Notifications from "./pages/Notifications";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/edit-project/:id" element={<EditProject />} />
        <Route path="/project/:id" element={<ViewProject />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create-post/:id" element={<CreatePost />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen animated-gradient">
        <Layout />
      </div>
    </Router>
  );
}

export default App;