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
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Loader2, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const form = useForm<InsertUser>({
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

  const handleVerificationSubmit = async () => {
    try {
      const response = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.reload(); // Refresh to update auth state
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <img 
                src="/attached_assets/logo_1740475848749.png" 
                alt="GlucoSmart Logo" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome to GlucoSmart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVerification ? (
              <div className="space-y-4">
                <Alert>
                  <Phone className="h-4 w-4" />
                  <AlertDescription>
                    Please enter the verification code sent to your phone
                  </AlertDescription>
                </Alert>
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <Button
                  onClick={handleVerificationSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Verify Phone Number
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Login
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(async (data) => {
                        try {
                          const response = await fetch("/api/register", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                          });

                          if (response.ok) {
                            const result = await response.json();
                            setUserId(result.user.id);
                            setPendingVerification(true);
                          } else {
                            const error = await response.text();
                            throw new Error(error);
                          }
                        } catch (error) {
                          console.error("Registration error:", error);
                        }
                      })}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+91XXXXXXXXXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
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
                        control={form.control}
                        name="place"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Place</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500 to-cyan-500 items-center justify-center p-12 text-white">
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