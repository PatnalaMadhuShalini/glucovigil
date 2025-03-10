import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  console.log(`ProtectedRoute [${path}]:`, { isAuthenticated: !!user, isLoading });

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          );
        }

        if (!user) {
          console.log(`ProtectedRoute [${path}]: Redirecting to /auth due to no user`);
          return <Redirect to="/auth" />;
        }

        console.log(`ProtectedRoute [${path}]: Rendering protected component`);
        return <Component />;
      }}
    </Route>
  );
}