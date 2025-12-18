import { useNavigate } from "react-router-dom";
import { Role, useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";

const Home: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Card */}
      <Card className="mb-6 p-8" noPadding>
        <div className="flex items-start gap-6">
          {/* Large Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-3xl">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome, {profile?.name}!
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                {profile?.role === Role.TECH_LEAD && (
                  <Button
                    onClick={() => navigate("/validation-inbox")}
                    data-testid="view-profile-button"
                  >
                    Validation Inbox
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/profile")}
                  data-testid="view-profile-button"
                >
                  Employee Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
