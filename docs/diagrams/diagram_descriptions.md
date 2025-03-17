
# GlucoVigil Health Analytics System Diagrams

## 1. Activity Diagram (Flow Diagram)
The activity diagram illustrates the core user workflow from registration to health monitoring:

1. Initial Flow:
   - Starts with User Registration
   - Email Verification process
   - Parallel collection of user data:
     - Demographics completion
     - Physical metrics input
     - Lifestyle data entry
     - Medical history upload

2. Data Processing:
   - Data validation
   - Completeness check
   - Risk score calculation
   - Risk level assessment (High vs Low/Medium)

3. Output Generation:
   - High Risk: Urgent alerts and priority recommendations
   - Low/Medium Risk: Standard report and general recommendations
   - Dashboard display with:
     - Risk factors
     - Health metrics
     - Recommendations
   - Progress tracking enablement

## 2. State Chart Diagram
The state chart shows the system's state transitions:

1. User States:
   - Unregistered → PendingVerification
   - ProfileIncomplete → BasicProfile
   - ComprehensiveProfile → DataProcessing
   - RiskAssessed → RecommendationsGenerated

2. Monitoring States:
   - MonitoringActive
   - ActiveTracking
   - GoalProgress
   - Periodic Review
   - Account suspension for inactivity

## 3. Use Case Diagram
The use case diagram shows system functionality for two primary actors:

1. Patient Actor:
   - User Management (Register, Authenticate, Profile)
   - Health Data Management
   - Risk Assessment
   - Recommendations
   - Progress Monitoring
   - Reports
   - Feedback

2. Admin Actor:
   - Access to all patient functions
   - System optimization
   - User management
   - Report generation

## 4. Class Diagram
The class diagram shows the system's object-oriented structure:

1. Core Classes:
   - AuthService: Handles authentication
   - User: Manages user data and actions
   - HealthData: Central data storage
   - RiskAssessmentService: Risk calculation
   - RecommendationService: Generates advice
   - ReportService: Creates reports

2. Supporting Classes:
   - Demographics: User background info
   - Physiological: Physical measurements
   - Lifestyle: Behavioral data
   - MentalHealth: Psychological factors
   - BloodPressure: Specific health metrics
   - Prediction: Risk assessment results

3. Key Relationships:
   - User has HealthData (1 to many)
   - HealthData contains various health components
   - RiskAssessmentService analyzes HealthData
   - RecommendationService creates Predictions
   - ReportService formats results

These diagrams collectively represent the complete system architecture and workflow of the GlucoVigil Health Analytics platform.
