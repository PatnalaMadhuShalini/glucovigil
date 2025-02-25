import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import VoiceAssistant from "@/components/voice-assistant";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <VoiceAssistant />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;