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
  Loader2
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

const moodRecommendations: Record<string, MoodRecommendation> = {
  happy: {
    mood: "happy",
    recommendations: [
      "Channel your positive energy into productive activities",
      "Share your good mood with others through social connections",
      "Document what made you happy to reference on harder days",
      "Use this motivation to tackle challenging tasks"
    ]
  },
  calm: {
    mood: "calm",
    recommendations: [
      "Practice mindfulness to maintain this balanced state",
      "Consider gentle yoga or stretching exercises",
      "Use this time for planning and reflection",
      "Focus on creative activities"
    ]
  },
  stressed: {
    mood: "stressed",
    recommendations: [
      "Take deep breathing exercises (4-7-8 breathing)",
      "Step away for a short walk outside",
      "Practice progressive muscle relaxation",
      "Consider limiting caffeine intake"
    ]
  },
  anxious: {
    mood: "anxious",
    recommendations: [
      "Ground yourself using the 5-4-3-2-1 senses technique",
      "Write down your worries to gain perspective",
      "Engage in light physical activity",
      "Reach out to a trusted friend or professional"
    ]
  },
  sad: {
    mood: "sad",
    recommendations: [
      "Ensure you're getting enough sunlight and vitamin D",
      "Maintain social connections, even if briefly",
      "Practice self-care activities you enjoy",
      "Consider talking to a mental health professional"
    ]
  },
  energetic: {
    mood: "energetic",
    recommendations: [
      "Channel energy into exercise or physical activity",
      "Take on challenging tasks you've been postponing",
      "Engage in creative projects",
      "Balance activity with proper rest periods"
    ]
  },
  tired: {
    mood: "tired",
    recommendations: [
      "Review your sleep schedule and quality",
      "Take short power naps (15-20 minutes)",
      "Ensure proper hydration and nutrition",
      "Consider gentle movement to boost energy"
    ]
  }
};

interface MoodRecommendation {
  mood: string;
  recommendations: string[];
}

export default function MoodTracker() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<string[]>([]);

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
      console.log("Submitting mood data:", data);
      const res = await apiRequest("POST", "/api/mood", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save mood data");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Your mood has been recorded successfully",
      });
      setShowForm(false);
    },
    onError: (error: Error) => {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMoodSelection = (mood: string) => {
    form.setValue("currentMood", mood as any);
    const recommendations = moodRecommendations[mood]?.recommendations || [];
    setCurrentRecommendations(recommendations);
  };

  const onSubmit = async (data: Mood) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
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
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Mood Tracker & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Track your mood to get personalized health recommendations
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Record Current Mood
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentMood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">How are you feeling right now?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => handleMoodSelection(value)}
                        value={field.value}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                      >
                        {moodOptions.map((mood) => {
                          const Icon = moodIcons[mood.value as keyof typeof moodIcons];
                          return (
                            <div
                              key={mood.value}
                              className="relative"
                            >
                              <RadioGroupItem
                                value={mood.value}
                                id={mood.value}
                                className="peer sr-only"
                              />
                              <label
                                htmlFor={mood.value}
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer hover:bg-blue-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
                              >
                                <Icon className="h-6 w-6" />
                                <span>{mood.label}</span>
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

              {currentRecommendations.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-medium mb-3">Recommended Actions:</h3>
                  <ul className="space-y-2">
                    {currentRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                        className="py-4"
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Strong</span>
                    </div>
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
                <Button 
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Mood"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}