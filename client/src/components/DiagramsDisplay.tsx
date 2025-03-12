import React from 'react';

export function UseCaseDiagram() {
  return (
    <div className="diagram-container">
      <h2>Use Case Diagram</h2>
      <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        {/* System boundary */}
        <rect x="200" y="50" width="400" height="500" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" rx="10" />
        <text x="400" y="80" textAnchor="middle" fontSize="18" fontWeight="bold">GlucoVigile System</text>
        
        {/* Actors */}
        {/* End User */}
        <circle cx="100" cy="200" r="20" fill="#f8f9fa" stroke="#333" strokeWidth="2" />
        <line x1="100" y1="220" x2="100" y2="270" stroke="#333" strokeWidth="2" />
        <line x1="60" y1="240" x2="140" y2="240" stroke="#333" strokeWidth="2" />
        <line x1="100" y1="270" x2="60" y2="320" stroke="#333" strokeWidth="2" />
        <line x1="100" y1="270" x2="140" y2="320" stroke="#333" strokeWidth="2" />
        <text x="100" y="350" textAnchor="middle" fontSize="14">End User</text>
        
        {/* Healthcare Provider */}
        <circle cx="700" cy="200" r="20" fill="#f8f9fa" stroke="#333" strokeWidth="2" />
        <line x1="700" y1="220" x2="700" y2="270" stroke="#333" strokeWidth="2" />
        <line x1="660" y1="240" x2="740" y2="240" stroke="#333" strokeWidth="2" />
        <line x1="700" y1="270" x2="660" y2="320" stroke="#333" strokeWidth="2" />
        <line x1="700" y1="270" x2="740" y2="320" stroke="#333" strokeWidth="2" />
        <text x="700" y="350" textAnchor="middle" fontSize="14">Healthcare Provider</text>
        
        {/* Use Cases - Ellipses */}
        {/* Risk Assessment */}
        <ellipse cx="400" cy="150" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="155" textAnchor="middle" fontSize="14">Perform Risk Assessment</text>
        
        {/* Health Tracking */}
        <ellipse cx="400" cy="230" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="235" textAnchor="middle" fontSize="14">Track Health Metrics</text>
        
        {/* Medical Records Analysis */}
        <ellipse cx="400" cy="310" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="315" textAnchor="middle" fontSize="14">Analyze Medical Records</text>
        
        {/* Get Recommendations */}
        <ellipse cx="400" cy="390" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="395" textAnchor="middle" fontSize="14">Get Recommendations</text>
        
        {/* Monitor Progress */}
        <ellipse cx="400" cy="470" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="475" textAnchor="middle" fontSize="14">Monitor Progress</text>
        
        {/* Relationships */}
        {/* End User to Use Cases */}
        <line x1="140" y1="200" x2="300" y2="150" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="220" x2="300" y2="230" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="240" x2="300" y2="310" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="260" x2="300" y2="390" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="280" x2="300" y2="470" stroke="#333" strokeWidth="1.5" />
        
        {/* Healthcare Provider to Use Cases */}
        <line x1="660" y1="200" x2="500" y2="150" stroke="#333" strokeWidth="1.5" />
        <line x1="660" y1="220" x2="500" y2="310" stroke="#333" strokeWidth="1.5" />
        <line x1="660" y1="240" x2="500" y2="390" stroke="#333" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function ActivityDiagram() {
  return (
    <div className="diagram-container">
      <h2>Activity Diagram</h2>
      <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        {/* Start node */}
        <circle cx="400" cy="50" r="15" fill="#000" />
        
        {/* Activities */}
        {/* User Registration */}
        <rect x="300" y="100" width="200" height="60" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="400" y="138" textAnchor="middle" fontSize="14">User Registration</text>
        
        {/* Health Data Collection */}
        <rect x="300" y="200" width="200" height="60" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="400" y="238" textAnchor="middle" fontSize="14">Health Data Collection</text>
        
        {/* Decision Node */}
        <polygon points="400,300 440,340 400,380 360,340" fill="#fff3e0" stroke="#ef6c00" strokeWidth="2" />
        <text x="400" y="345" textAnchor="middle" fontSize="12">Is data complete?</text>
        
        {/* Risk Assessment */}
        <rect x="300" y="420" width="200" height="60" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="400" y="458" textAnchor="middle" fontSize="14">Risk Assessment Algorithm</text>
        
        {/* Generate Recommendations */}
        <rect x="300" y="520" width="200" height="60" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="400" y="558" textAnchor="middle" fontSize="14">Generate Recommendations</text>
        
        {/* Display Results */}
        <rect x="300" y="620" width="200" height="60" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="400" y="658" textAnchor="middle" fontSize="14">Display Results</text>
        
        {/* End node */}
        <circle cx="400" cy="720" r="15" fill="#fff" stroke="#000" strokeWidth="3" />
        <circle cx="400" cy="720" r="9" fill="#000" />
        
        {/* Incomplete Data Handling */}
        <rect x="550" y="310" width="180" height="60" rx="10" fill="#ffebee" stroke="#c62828" strokeWidth="2" />
        <text x="640" y="348" textAnchor="middle" fontSize="14">Request Missing Data</text>
        
        {/* Arrows */}
        <line x1="400" y1="65" x2="400" y2="100" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="400" y1="160" x2="400" y2="200" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="400" y1="260" x2="400" y2="300" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="400" y1="380" x2="400" y2="420" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="400" y1="480" x2="400" y2="520" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="400" y1="580" x2="400" y2="620" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="400" y1="680" x2="400" y2="705" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Decision branches */}
        <line x1="440" y1="340" x2="550" y2="340" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="640" y1="370" x2="640" y2="400" stroke="#333" strokeWidth="2" />
        <line x1="640" y1="400" x2="400" y2="400" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="460" y="330" textAnchor="start" fontSize="12">No</text>
        <text x="400" y="400" textAnchor="start" fontSize="12">Yes</text>
        
        {/* Arrow definitions */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function DiagramsDisplay() {
  return (
    <div className="max-w-[850px] mx-auto p-5 font-sans">
      <h1 className="text-[#2c3e50] text-center mb-2">GlucoVigile System Diagrams</h1>
      <p className="text-center text-[#7f8c8d] mb-8">
        These diagrams illustrate the key components and workflows of the GlucoVigile health analytics system.
      </p>
      
      <div className="mb-12 p-5 bg-white rounded-lg shadow-md">
        <UseCaseDiagram />
      </div>
      
      <div className="mb-12 p-5 bg-white rounded-lg shadow-md">
        <ActivityDiagram />
      </div>
    </div>
  );
}