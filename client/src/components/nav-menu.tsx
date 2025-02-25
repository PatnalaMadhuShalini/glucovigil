import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";

export default function NavMenu() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth');
      }
    });
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <img 
            src="/logo.svg"
            alt="GlucoSmart Logo" 
            className="h-10 w-auto cursor-pointer"
          />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}