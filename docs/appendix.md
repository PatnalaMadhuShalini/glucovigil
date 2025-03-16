
# Appendix

## A. Sample Code Documentation

### A.1 Risk Assessment Implementation
```typescript
// Example of the core risk assessment function
function calculateDiabetesRisk(healthData: HealthData): RiskAssessment {
  const riskFactors: RiskFactor[] = [];
  let totalScore = 0;

  // Demographic risk factors
  if (healthData.age > 45) {
    totalScore += 2;
    riskFactors.push({
      factor: "Age",
      impact: "Moderate",
      description: "Age above 45 increases diabetes risk"
    });
  }

  // BMI calculation and assessment
  const bmi = calculateBMI(healthData.height, healthData.weight);
  if (bmi > 30) {
    totalScore += 3;
    riskFactors.push({
      factor: "BMI",
      impact: "High",
      description: "BMI indicates obesity"
    });
  }

  return {
    score: normalizeScore(totalScore),
    riskLevel: determineRiskLevel(totalScore),
    factors: riskFactors
  };
}
```

### A.2 Health Data Management
```typescript
// Example of health data validation
interface HealthData {
  bloodSugar: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  weight: number;
  height: number;
}

function validateHealthData(data: HealthData): ValidationResult {
  const errors: string[] = [];
  
  if (data.bloodSugar < 0 || data.bloodSugar > 500) {
    errors.push("Invalid blood sugar reading");
  }
  
  if (data.bloodPressure.systolic < 70 || data.bloodPressure.systolic > 200) {
    errors.push("Invalid systolic pressure");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### A.3 Recommendation Generation
```typescript
// Example of recommendation generation logic
function generateRecommendations(riskFactors: RiskFactor[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  riskFactors.forEach(factor => {
    switch (factor.factor) {
      case "BMI":
        recommendations.push({
          type: "Exercise",
          priority: "High",
          description: "Implement 30 minutes daily moderate exercise",
          rationale: "Regular exercise helps improve insulin sensitivity"
        });
        break;
      case "BloodSugar":
        recommendations.push({
          type: "Diet",
          priority: "High",
          description: "Reduce refined carbohydrate intake",
          rationale: "Helps maintain stable blood glucose levels"
        });
        break;
    }
  });

  return recommendations;
}
```

## B. Testing Documentation

### B.1 Unit Test Examples
```typescript
describe('Risk Assessment Tests', () => {
  test('should calculate correct risk score for high-risk profile', () => {
    const testData = {
      age: 50,
      bmi: 32,
      bloodSugar: 130,
      familyHistory: true
    };
    
    const result = calculateDiabetesRisk(testData);
    expect(result.riskLevel).toBe('high');
    expect(result.score).toBeGreaterThan(3);
  });
});
```

## C. Database Schema
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  data JSONB NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## D. API Documentation

### D.1 Risk Assessment Endpoint
```typescript
/**
 * @api {post} /api/risk-assessment Calculate Risk
 * @apiName CalculateRisk
 * @apiGroup Risk Assessment
 * @apiVersion 1.0.0
 * 
 * @apiParam {Object} healthData User health data
 * @apiSuccess {Object} assessment Risk assessment results
 */
```
