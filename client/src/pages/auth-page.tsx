import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { InsertUser, insertUserSchema } from "@shared/schema";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

  const handleLogin = async (data: LoginData) => {
    try {
      await loginMutation.mutateAsync(data);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      // Display an error alert
      //This part is added to display error messages
      // Add error handling for login
    }
  };

  const handleRegister = async (data: InsertUser) => {
    try {
      await registerMutation.mutateAsync(data);
      registerForm.reset();
      setActiveTab("login");
    } catch (error) {
      console.error("Registration failed:", error);
      // Display an error alert
      //This part is added to display error messages
      // Add error handling for registration
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Left side - Auth form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <img
                src="/logo.svg"
                alt="GlucoSmart Logo"
                className="h-32 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Welcome to GlucoSmart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-gray-700">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-gray-700">Register</TabsTrigger>
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
                          <FormLabel className="text-gray-700">Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="border-gray-200 focus:border-blue-300 text-gray-900" 
                            />
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
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              className="border-gray-200 focus:border-blue-300 text-gray-900" 
                            />
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
                          <FormLabel className="text-blue-900">Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" />
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
                          <FormLabel className="text-blue-900">Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" />
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
                          <FormLabel className="text-blue-900">Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" />
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
                          <FormLabel className="text-blue-900">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+91XXXXXXXXXX" className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" />
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
                          <FormLabel className="text-blue-900">Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
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
                          <FormLabel className="text-blue-900">Place</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" />
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
                          <FormLabel className="text-blue-900">Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" />
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

      {/* Right side - Hero section */}
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