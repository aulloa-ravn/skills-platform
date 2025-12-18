import { RouterProvider } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { AuthProvider } from "./contexts/AuthContext";
import { apolloClient } from "./apollo/client";
import { router } from "./routing/routes";
import "./App.css";

/**
 * Main App component with routing and providers
 */
function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
