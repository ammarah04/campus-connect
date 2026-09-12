import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Societies from "./pages/Societies.jsx";
import CreateSociety from "./pages/CreateSociety.jsx";
import SocietyDetails from "./pages/SocietyDetails.jsx";
import SocietyAdminDashboard from "./pages/SocietyAdminDashboard.jsx";
import SocietyApplicants from "./pages/SocietyApplicants.jsx";
import Events from "./pages/Events.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Announcements from "./pages/Announcements.jsx";
import CreateAnnouncement from "./pages/CreateAnnouncement.jsx";
import Discussions from "./pages/Discussions.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import StudyResources from "./pages/StudyResources.jsx";
import UploadStudyResource from "./pages/UploadStudyResource.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UniversityAdminDashboard from "./pages/UniversityAdminDashboard.jsx"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/societies" element={<ProtectedRoute><Societies /></ProtectedRoute>} />
      <Route path="/societies/new" element={<ProtectedRoute><CreateSociety /></ProtectedRoute>} />
      <Route path="/societies/:id" element={<ProtectedRoute><SocietyDetails /></ProtectedRoute>} />
      <Route path="/societies/:id/dashboard" element={<ProtectedRoute><SocietyAdminDashboard /></ProtectedRoute>} />
      <Route path="/societies/:id/applicants" element={<ProtectedRoute><SocietyApplicants /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/events/new" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
      <Route path="/events/:eventId/check-in" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/announcements/new" element={<ProtectedRoute><CreateAnnouncement /></ProtectedRoute>} />
      <Route path="/discussions" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
      <Route path="/discussions/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      <Route path="/discussions/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
      <Route path="/study-resources" element={<ProtectedRoute><StudyResources /></ProtectedRoute>} />
      <Route path="/study-resources/new" element={<ProtectedRoute><UploadStudyResource /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><UniversityAdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;