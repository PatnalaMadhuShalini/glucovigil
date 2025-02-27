import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";
import { User, Home, LayoutDashboard, LogOut } from "lucide-react";

export default function NavMenu() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
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
              <span className="flex items-center group cursor-pointer"> {/* Replaced <a> with <span> */}
                <img 
                  src="/logo.svg"
                  alt="GlucoSmart Logo" 
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                />
                <span className="ml-2 text-lg font-medium text-white/90">
                  GlucoSmart
                </span>
              </span>
            </Link>

            {user && (
              <div className="ml-8 flex items-center space-x-2">
                <Link href="/">
                  <span className={linkClass('/')} title="Home"> {/* Replaced <a> with <span> */}
                    <span className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Home
                    </span>
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className={linkClass('/dashboard')} title="Dashboard"> {/* Replaced <a> with <span> */}
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </span>
                  </span>
                </Link>
                <Link href="/profile">
                  <span className={linkClass('/profile')} title="Profile"> {/* Replaced <a> with <span> */}
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </span>
                  </span>
                </Link>
              </div>
            )}
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
                <span className="bg-gradient-to-r from-blue-500/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 cursor-pointer"> {/* Replaced <a> with <span> */}
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}