
# Object Diagram for GlucoSmart Health Analytics

```mermaid
classDiagram
    class JohnDoe {
        id: 1
        username: "johndoe"
        email: "john@example.com"
        gender: "male"
        verified: true
    }
    
    class JohnHealthData {
        id: 1
        userId: 1
        createdAt: "2023-07-15T14:30:00Z"
    }
    
    class JohnDemographics {
        age: 45
        gender: "male" 
        ethnicity: "Caucasian"
    }
    
    class JohnPhysiological {
        height: 175 cm
        weight: 82 kg
        bloodSugar: 110 mg/dL
        bloodPressure: {systolic: 130, diastolic: 85}
        BMI: 26.8
    }
    
    class JohnLifestyle {
        exercise: "moderate"
        diet: "fair"
        smoking: "former"
        alcohol: "occasional"
    }
    
    class JohnMentalHealth {
        stressLevel: "high"
        sleepQuality: "poor"
        moodState: "anxious"
    }
    
    class JohnPrediction {
        score: 3.7
        level: "high"
        recommendations: ["Increase physical activity", "Reduce carbohydrate intake", "Improve sleep hygiene"]
        riskFactors: ["BMI over 25", "Elevated blood sugar", "Poor sleep quality", "High stress level"]
    }
    
    JohnDoe "1" --> "1" JohnHealthData: has
    JohnHealthData --> "1" JohnDemographics: contains
    JohnHealthData --> "1" JohnPhysiological: contains
    JohnHealthData --> "1" JohnLifestyle: contains
    JohnHealthData --> "1" JohnMentalHealth: contains
    JohnHealthData --> "1" JohnPrediction: contains
```
