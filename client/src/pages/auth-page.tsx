import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Loader2 } from "lucide-react";

type LoginData = {
  username: string;
  password: string;
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "male",
      place: "",
    },
  });

  // Redirect logged-in users
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  const handleRegister = (data: InsertUser) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        registerForm.reset();
        setActiveTab("login");
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 animate-gradient-xy" />

      {/* Refined grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="flex-1 flex items-center justify-center p-8 relative">
        <Card className="w-full max-w-md shadow-lg bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <img
                src="/logo.svg"
                alt="GlucoSmart Logo"
                className="h-32 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Welcome to GlucoSmart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-white">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+91XXXXXXXXXX" className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" className="text-white" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male" className="text-white">Male</SelectItem>
                              <SelectItem value="female" className="text-white">Female</SelectItem>
                              <SelectItem value="other" className="text-white">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="place"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Place</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 items-center justify-center p-12 text-white relative">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">
            Take Control of Your Health Journey
          </h1>
          <p className="text-lg opacity-90">
            Get personalized diabetes risk assessments, expert recommendations, and track
            your health progress all in one place. Join us to make informed decisions
            about your well-being.
          </p>
        </div>
      </div>
    </div>
  );
}