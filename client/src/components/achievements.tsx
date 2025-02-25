import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Target, Heart } from "lucide-react";
import { type Achievement } from "@shared/schema";
import { motion } from "framer-motion";

const achievementIcons = {
  healthyLifestyle: Trophy,
  consistentTracking: Award,
  goalAchiever: Star,
  riskReducer: Target,
  healthyHeart: Heart,
};

interface AchievementsProps {
  achievements: Achievement[];
}

export default function Achievements({ achievements }: AchievementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy;
            
            return (
              <motion.div
                key={achievement.id}
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`
                  p-4 text-center hover:shadow-lg transition-shadow
                  ${achievement.unlockedAt ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'opacity-50'}
                `}>
                  <Icon 
                    className={`
                      h-8 w-8 mx-auto mb-2
                      ${achievement.unlockedAt ? 'text-yellow-500' : 'text-gray-400'}
                    `}
                  />
                  <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <Badge variant="secondary" className="mt-2">
                      Unlocked
                    </Badge>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
import { motion } from "framer-motion";
import { Trophy, Target, Heart, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Achievements({ healthData }: { healthData: any[] }) {
  const achievements = [
    {
      id: "consistent_tracking",
      name: "Health Tracker",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      condition: healthData.length >= 5,
      description: "Track health data for 5 consecutive days"
    },
    {
      id: "goal_achiever",
      name: "Goal Achiever",
      icon: <Target className="h-8 w-8 text-blue-500" />,
      condition: healthData[healthData.length - 1]?.prediction.level === "low",
      description: "Achieve low risk status"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Achievements</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg ${
              achievement.condition ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {achievement.icon}
            <h3 className="font-semibold mt-2">{achievement.name}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
