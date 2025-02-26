import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Target, Heart, Activity, CheckCircle, Medal } from "lucide-react";
import { type Achievement } from "@shared/schema";
import { motion } from "framer-motion";

// Map achievement IDs to icons
const achievementIcons: Record<string, typeof Trophy> = {
  first_check: Trophy,
  blood_sugar_control: Target,
  healthy_bmi: Activity,
  healthy_lifestyle: Heart,
  symptom_tracker: CheckCircle,
  default: Medal
};

interface AchievementsProps {
  achievements: Achievement[];
}

export default function Achievements({ achievements }: AchievementsProps) {
  if (!achievements?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Complete health assessments to earn achievements!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievementIcons[achievement.id] || achievementIcons.default;

            return (
              <motion.div
                key={achievement.id}
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50">
                  <Icon 
                    className="h-8 w-8 mx-auto mb-2 text-yellow-500"
                  />
                  <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Badge>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}