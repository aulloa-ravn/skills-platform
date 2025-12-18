import { Navigate, createBrowserRouter } from "react-router-dom";
import { BaseLayout } from "./base-layout";
import { PrivateLayout } from "./private-layout";
import { PublicLayout } from "./public-layout";
import Login from "../pages/Login";
import Home from "../pages/home";
import Profile from "../pages/Profile";
import Inbox from "../pages/Inbox";

export const router = createBrowserRouter([
  {
    element: <BaseLayout />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/validation-inbox",
            element: <Inbox />,
          },
        ],
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
