
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Link } from "wouter";

export default function NavMenu() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <img 
            src="/attached_assets/logo_1740475848749.png" 
            alt="GlucoSmart Logo" 
            className="h-10 w-auto cursor-pointer"
          />
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Button onClick={logout} variant="outline">Logout</Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
