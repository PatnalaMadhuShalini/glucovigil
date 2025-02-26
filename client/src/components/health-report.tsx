import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import type { HealthDataWithPrediction } from "@shared/schema";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  riskLevel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FF0000',
  },
  recommendations: {
    marginTop: 10,
  },
  recommendation: {
    fontSize: 12,
    marginBottom: 8,
  },
});

interface HealthReportProps {
  data: HealthDataWithPrediction;
}

// Create Document Component
const HealthReport = ({ data }: HealthReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Health Assessment Report</Text>
        
        <Text style={styles.subtitle}>Risk Assessment</Text>
        <Text style={styles.riskLevel}>
          Risk Level: {data.prediction?.level || 'Low'}
        </Text>
        <Text style={styles.text}>
          Risk Score: {data.prediction?.score || 0}/5
        </Text>

        <Text style={styles.subtitle}>Health Metrics</Text>
        <Text style={styles.text}>
          Blood Sugar: {data.physiological.bloodSugar} mg/dL
        </Text>
        <Text style={styles.text}>
          Blood Pressure: {data.physiological.bloodPressure.systolic}/{data.physiological.bloodPressure.diastolic} mmHg
        </Text>
        <Text style={styles.text}>
          Weight: {data.physiological.weight} kg
        </Text>
        <Text style={styles.text}>
          Height: {data.physiological.height} cm
        </Text>

        <Text style={styles.subtitle}>Lifestyle Factors</Text>
        <Text style={styles.text}>Exercise Level: {data.lifestyle.exercise}</Text>
        <Text style={styles.text}>Diet Quality: {data.lifestyle.diet}</Text>
        <Text style={styles.text}>Stress Level: {data.lifestyle.stressLevel}</Text>

        <Text style={styles.subtitle}>Recommendations</Text>
        <View style={styles.recommendations}>
          {data.prediction?.recommendations?.map((rec, index) => (
            <Text key={index} style={styles.recommendation}>
              • {rec}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default HealthReport;
