import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import ProfileCreation from "@/pages/profile-creation";
import Analysis from "@/pages/analysis";
import Progress from "@/pages/progress";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import ChatAssistant from "@/components/chat-assistant";
import NavMenu from "@/components/nav-menu";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/profile-page" component={ProfilePage} />
      <ProtectedRoute path="/profile-creation" component={ProfileCreation} />
      <ProtectedRoute path="/analysis" component={Analysis} />
      <ProtectedRoute path="/progress" component={Progress} />
      <Route path="/" component={HomePage} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavMenu />
        <Router />
        <ChatAssistant />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;