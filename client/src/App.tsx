import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import ChatAssistant from "@/components/chat-assistant";
import NavMenu from "@/components/nav-menu";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/auth">
        {() => (user ? <Redirect to="/dashboard" /> : <AuthPage />)}
      </Route>
      <Route path="/" exact>
        {() => (user ? <Redirect to="/dashboard" /> : <HomePage />)}
      </Route>
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen">
          <NavMenu />
          <Router />
          <ChatAssistant />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;