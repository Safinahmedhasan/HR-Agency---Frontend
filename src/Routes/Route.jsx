// Router/index.js
import { createBrowserRouter } from "react-router-dom";
import Main from "../Layouts/Main/Main";
import Home from "../Pages/Users/Home/Home";
import Login from "../Pages/Users/Auth/Login/Login";
import Register from "../Pages/Users/Auth/Register/Register";
import AdminLogin from "../Pages/Admin/Auth/AdminLogin";
import AdminProtectedRoute from "../components/Admin/AdminProtectedRoute/AdminProtectedRoute";
import ProtectedRoute from "../components/Users/ProtectedRoute/ProtectedRoute";

// Admin Pages
import AdminDashboard from "../Pages/Admin/AdminDashboard/AdminDashboard";
import AdminLayout from "../Layouts/Admin/AdminLayout/AdminLayout";
import UserManagement from "../Pages/Admin/UserManagement/UserManagement";
import PendingUser from "../Pages/Admin/PendingUser/PendingUser";
import ApproveUser from "../Pages/Admin/ApproveUser/ApproveUser";
import AdminProfile from "../Pages/Admin/Profile/AdminProfile";
import SiteSetting from "../Pages/Admin/SiteSetting/SiteSetting";

export const router = createBrowserRouter([
  // User Routes with Main Layout
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },

  // User Authentication Routes
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // Admin Authentication Routes (Outside Layout)
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },

  // Admin Routes with AdminLayout (Sidebar System)
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "PendingUser",
        element: <PendingUser />,
      },
      {
        path: "approve-users",
        element: <ApproveUser />,
      },
      {
        path: "AdminProfile",
        element: <AdminProfile />,
      },
      {
        path: "SiteSetting",
        element: <SiteSetting />,
      },
    ],
  },
]);
