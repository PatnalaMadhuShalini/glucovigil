import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";
import { User } from "lucide-react";

export default function NavMenu() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/auth';
      }
    });
  };

  const isActive = (path: string) => location === path;

  const linkClass = (path: string) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${isActive(path) 
      ? 'bg-blue-50 text-blue-700' 
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
  `;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <img 
                  src="/logo.svg"
                  alt="GlucoSmart Logo" 
                  className="h-10 w-auto cursor-pointer"
                />
                <span className="ml-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  GlucoSmart
                </span>
              </a>
            </Link>

            {user && (
              <div className="ml-8 flex items-center space-x-4">
                <Link href="/">
                  <a className={linkClass('/')}>Home</a>
                </Link>
                <Link href="/dashboard">
                  <a className={linkClass('/dashboard')}>Dashboard</a>
                </Link>
                <Link href="/profile">
                  <a className={linkClass('/profile')}>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </span>
                  </a>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                disabled={logoutMutation.isPending}
                className="ml-4 border-blue-200 hover:bg-blue-50"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}