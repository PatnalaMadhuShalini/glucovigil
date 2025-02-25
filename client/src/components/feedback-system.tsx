
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function FeedbackSystem() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment: feedback }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Thank you for your feedback!",
        });
        setFeedback("");
        setRating(0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant={rating === value ? "default" : "outline"}
                  onClick={() => setRating(value)}
                  className="w-10 h-10"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comments</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience and suggestions..."
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!rating || !feedback}
            className="w-full"
          >
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
