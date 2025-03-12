import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5001;

// Serve static files from the docs directory
app.use('/docs', express.static(join(__dirname, 'docs')));

// Serve individual diagram files directly
app.get('/use-case', (req, res) => {
  res.sendFile(join(__dirname, 'docs/diagrams/use_case_diagram.html'));
});

app.get('/activity', (req, res) => {
  res.sendFile(join(__dirname, 'docs/diagrams/activity_diagram.html'));
});

// Root route to provide links to diagrams
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GlucoVigile Diagrams</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; }
          .links { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
          a { display: block; padding: 10px; background-color: #f1f8ff; text-decoration: none; color: #0366d6; border-radius: 4px; }
          a:hover { background-color: #e1e4e8; }
        </style>
      </head>
      <body>
        <h1>GlucoVigile Diagram Viewer</h1>
        <p>Click on any of the links below to view the diagrams:</p>
        
        <div class="links">
          <a href="/use-case" target="_blank">Use Case Diagram</a>
          <a href="/activity" target="_blank">Activity Diagram</a>
          <a href="/docs/diagrams/class_diagram.html" target="_blank">Class Diagram</a>
          <a href="/docs/diagrams/component_diagram.html" target="_blank">Component Diagram</a>
          <a href="/docs/diagrams/deployment_diagram.html" target="_blank">Deployment Diagram</a>
          <a href="/docs/diagrams/sequence_diagram.html" target="_blank">Sequence Diagram</a>
          <a href="/docs/diagrams/object_diagram.html" target="_blank">Object Diagram</a>
          <a href="/docs/diagrams/state_chart_diagram.html" target="_blank">State Chart Diagram</a>
          <a href="/docs/diagrams/database_visualizer.html" target="_blank">Database Visualizer</a>
          <a href="/docs/diagrams/schema_tables.html" target="_blank">Schema Tables</a>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Diagram server running at http://0.0.0.0:${PORT}`);
});