import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";

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
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <img 
                src="/logo.svg"
                alt="GlucoSmart Logo" 
                className="h-12 w-auto cursor-pointer"
              />
            </Link>

            {user && (
              <div className="ml-8 flex items-center space-x-4">
                <Link href="/">
                  <span className={linkClass('/')}>Home</span>
                </Link>
                <Link href="/dashboard">
                  <span className={linkClass('/dashboard')}>Dashboard</span>
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
                className="ml-4"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
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