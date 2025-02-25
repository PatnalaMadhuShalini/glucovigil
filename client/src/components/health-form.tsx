import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { healthDataSchema, type HealthData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HealthForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<HealthData>({
    resolver: zodResolver(healthDataSchema),
    defaultValues: {
      demographics: {
        age: 0,
        gender: "male",
        ethnicity: "",
      },
      physiological: {
        height: 0,
        weight: 0,
        bloodPressure: {
          systolic: 0,
          diastolic: 0,
        },
        bloodSugar: 0
      },
      lifestyle: {
        exercise: "none",
        diet: "fair",
        stressLevel: "moderate",
        workStyle: "sedentary",
        alcohol: false,
        smoking: false
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: HealthData) => {
      setError(null);
      const res = await apiRequest("POST", "/api/health-data", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit health data");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Your health data has been saved successfully",
      });
      onComplete();
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HealthData) => {
    const transformedData: HealthData = {
      demographics: {
        age: Number(data.demographics.age),
        gender: data.demographics.gender,
        ethnicity: data.demographics.ethnicity,
      },
      physiological: {
        height: Number(data.physiological.height),
        weight: Number(data.physiological.weight),
        bloodPressure: {
          systolic: Number(data.physiological.bloodPressure.systolic),
          diastolic: Number(data.physiological.bloodPressure.diastolic),
        },
        bloodSugar: Number(data.physiological.bloodSugar),
      },
      lifestyle: {
        exercise: data.lifestyle.exercise,
        diet: data.lifestyle.diet,
        stressLevel: data.lifestyle.stressLevel,
        workStyle: data.lifestyle.workStyle,
        alcohol: data.lifestyle.alcohol,
        smoking: data.lifestyle.smoking
      }
    };

    mutation.mutate(transformedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Demographics Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Demographics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="demographics.age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demographics.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="demographics.ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethnicity</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Physiological Data Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Physiological Data</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="physiological.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodPressure.systolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic Blood Pressure</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodPressure.diastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic Blood Pressure</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodSugar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Sugar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Lifestyle Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lifestyle</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="lifestyle.exercise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet Quality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.stressLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.workStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Style</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light Activity</SelectItem>
                      <SelectItem value="moderate">Moderate Activity</SelectItem>
                      <SelectItem value="active">Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.alcohol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Consumption</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Add smoking field to lifestyle section */}
        <FormField
          control={form.control}
          name="lifestyle.smoking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Smoking</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                value={field.value ? "true" : "false"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Do you smoke?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Health Data"
          )}
        </Button>
      </form>
    </Form>
  );
}