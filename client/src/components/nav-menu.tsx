import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";
import { User, Home, LayoutDashboard, LogOut } from "lucide-react";

export default function NavMenu() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location === path;

  const linkClass = (path: string) => `
    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
    ${isActive(path) 
      ? 'bg-white/10 text-white' 
      : 'text-blue-100/70 hover:text-white hover:bg-white/5'}
  `;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-violet-900/80 border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center group cursor-pointer">
                <img 
                  src="/logo.svg"
                  alt="GlucoVigil Logo" 
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                />
                <span className="ml-2 text-lg font-medium text-white/90">
                  GlucoVigil
                </span>
              </div>
            </Link>

            <div className="ml-8 flex items-center space-x-2">
              <Link href="/">
                <div className={linkClass('/')} title="Home">
                  <span className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </span>
                </div>
              </Link>

              {user && (
                <>
                  <Link href="/dashboard">
                    <div className={linkClass('/dashboard')} title="Dashboard">
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </span>
                    </div>
                  </Link>
                  <Link href="/profile-page">
                    <div className={linkClass('/profile-page')} title="Profile">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <Button 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                variant="ghost"
                className="text-blue-100/70 hover:text-white hover:bg-white/5 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-500/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2">
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