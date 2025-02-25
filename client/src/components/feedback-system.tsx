import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Star, StarHalf } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeedbackSystem() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating || !feedback || !category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, category, comment: feedback }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Thank you for your feedback! Your input helps us improve.",
        });
        setFeedback("");
        setRating(0);
        setCategory("");
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`text-2xl transition-colors ${
              value <= (hoveredRating || rating)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(value)}
          >
            <Star className="h-8 w-8" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Rate Your Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Rating</label>
            <div className="flex justify-center">{renderStars()}</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usability">Usability</SelectItem>
                <SelectItem value="features">Features</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Your Comments</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience and suggestions for improvement..."
              className="min-h-[150px] resize-none"
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!rating || !feedback || !category}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}