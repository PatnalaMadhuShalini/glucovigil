import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { moodSchema, type Mood } from "@shared/schema";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Sun,
  Moon,
  Battery,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Zap,
  Coffee,
} from "lucide-react";

const moodIcons = {
  happy: Smile,
  sad: Frown,
  calm: Moon,
  stressed: AlertCircle,
  anxious: Brain,
  energetic: Zap,
  tired: Coffee,
};

export default function MoodTracker() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<Mood>({
    resolver: zodResolver(moodSchema),
    defaultValues: {
      intensity: 3,
      sleepQuality: "fair",
      energyLevel: "moderate",
      triggers: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Mood) => {
      const res = await apiRequest("POST", "/api/mood", {
        ...data,
        recordedAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Your mood has been recorded",
      });
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Mood) => {
    mutation.mutateAsync(data);
  };

  const moodOptions = [
    { value: "happy", label: "Happy" },
    { value: "calm", label: "Calm" },
    { value: "stressed", label: "Stressed" },
    { value: "anxious", label: "Anxious" },
    { value: "sad", label: "Sad" },
    { value: "energetic", label: "Energetic" },
    { value: "tired", label: "Tired" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Mood Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Track your mood to get personalized health recommendations
            </p>
            <Button onClick={() => setShowForm(true)}>Record Current Mood</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentMood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How are you feeling right now?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        {moodOptions.map((mood) => {
                          const Icon = moodIcons[mood.value as keyof typeof moodIcons];
                          return (
                            <div
                              key={mood.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem value={mood.value} id={mood.value} />
                              <label
                                htmlFor={mood.value}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Icon className="h-4 w-4" />
                                {mood.label}
                              </label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How intense is this feeling? (1-5)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Intense</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you sleep last night?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-2"
                      >
                        {["poor", "fair", "good", "excellent"].map((quality) => (
                          <div key={quality} className="flex items-center space-x-2">
                            <RadioGroupItem value={quality} id={quality} />
                            <label
                              htmlFor={quality}
                              className="capitalize cursor-pointer"
                            >
                              {quality}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any additional notes?</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional notes about your mood" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save Mood"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
