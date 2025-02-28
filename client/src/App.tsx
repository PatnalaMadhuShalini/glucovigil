import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import DocumentationPage from "@/pages/documentation-page";
import { ProtectedRoute } from "./lib/protected-route";
import ChatAssistant from "@/components/chat-assistant";
import NavMenu from "@/components/nav-menu";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/documentation" component={DocumentationPage} />
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
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