import React from 'react';

export function UseCaseDiagram() {
  return (
    <div className="diagram-container">
      <h2>Use Case Diagram</h2>
      <svg width="800" height="700" viewBox="0 0 800 700" xmlns="http://www.w3.org/2000/svg">
        {/* System boundary */}
        <rect x="200" y="50" width="400" height="600" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" rx="10" />
        <text x="400" y="80" textAnchor="middle" fontSize="18" fontWeight="bold">GlucoVigile Health Analytics System</text>
        
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
        
        {/* System Administrator */}
        <circle cx="400" cy="650" r="20" fill="#f8f9fa" stroke="#333" strokeWidth="2" />
        <line x1="400" y1="670" x2="400" y2="720" stroke="#333" strokeWidth="2" />
        <line x1="360" y1="690" x2="440" y2="690" stroke="#333" strokeWidth="2" />
        <line x1="400" y1="720" x2="360" y2="770" stroke="#333" strokeWidth="2" />
        <line x1="400" y1="720" x2="440" y2="770" stroke="#333" strokeWidth="2" />
        <text x="400" y="800" textAnchor="middle" fontSize="14">System Administrator</text>
        
        {/* Use Cases - Ellipses */}
        {/* User Management */}
        <ellipse cx="400" cy="130" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="130" textAnchor="middle" fontSize="14">User Management</text>
        <text x="400" y="145" textAnchor="middle" fontSize="11">Register, Authenticate, Profile</text>
        
        {/* Health Data Management */}
        <ellipse cx="400" cy="200" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="200" textAnchor="middle" fontSize="14">Health Data Management</text>
        <text x="400" y="215" textAnchor="middle" fontSize="11">Input Data, Upload Records</text>
        
        {/* Risk Assessment */}
        <ellipse cx="400" cy="270" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="270" textAnchor="middle" fontSize="14">Risk Assessment</text>
        <text x="400" y="285" textAnchor="middle" fontSize="11">Calculate Score, Risk Factors</text>
        
        {/* Generate Recommendations */}
        <ellipse cx="400" cy="340" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="340" textAnchor="middle" fontSize="14">Generate Recommendations</text>
        <text x="400" y="355" textAnchor="middle" fontSize="11">Personalized Health Advice</text>
        
        {/* Monitor Progress */}
        <ellipse cx="400" cy="410" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="410" textAnchor="middle" fontSize="14">Monitor Progress</text>
        <text x="400" y="425" textAnchor="middle" fontSize="11">Track Health Improvements</text>
        
        {/* Reports & Education */}
        <ellipse cx="400" cy="480" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="480" textAnchor="middle" fontSize="14">Reports & Education</text>
        <text x="400" y="495" textAnchor="middle" fontSize="11">Generate Reports, Education</text>
        
        {/* System Administration */}
        <ellipse cx="400" cy="550" rx="90" ry="30" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
        <text x="400" y="550" textAnchor="middle" fontSize="14">System Administration</text>
        <text x="400" y="565" textAnchor="middle" fontSize="11">Monitor, Analyze, Maintain</text>
        
        {/* Relationships */}
        {/* End User to Use Cases */}
        <line x1="140" y1="200" x2="300" y2="130" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="210" x2="300" y2="200" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="220" x2="300" y2="270" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="230" x2="300" y2="340" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="240" x2="300" y2="410" stroke="#333" strokeWidth="1.5" />
        <line x1="140" y1="250" x2="300" y2="480" stroke="#333" strokeWidth="1.5" />
        
        {/* Healthcare Provider to Use Cases */}
        <line x1="660" y1="200" x2="500" y2="270" stroke="#333" strokeWidth="1.5" />
        <line x1="660" y1="210" x2="500" y2="340" stroke="#333" strokeWidth="1.5" />
        <line x1="660" y1="220" x2="500" y2="410" stroke="#333" strokeWidth="1.5" />
        <line x1="660" y1="230" x2="500" y2="480" stroke="#333" strokeWidth="1.5" />
        
        {/* System Administrator to Use Cases */}
        <line x1="400" y1="630" x2="400" y2="590" stroke="#333" strokeWidth="1.5" />
        
        {/* Include/Extend Relationships */}
        <path d="M 350 300 C 330 320, 330 320, 350 340" stroke="#333" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowhead)" />
        <text x="310" y="325" textAnchor="middle" fontSize="10" fill="#333">«include»</text>
        
        <path d="M 350 430 C 330 450, 330 450, 350 470" stroke="#333" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowhead)" />
        <text x="310" y="455" textAnchor="middle" fontSize="10" fill="#333">«extend»</text>
        
        {/* Arrow definitions */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export function ActivityDiagram() {
  return (
    <div className="diagram-container">
      <h2>Activity Diagram</h2>
      <svg width="900" height="1100" viewBox="0 0 900 1100" xmlns="http://www.w3.org/2000/svg">
        {/* Title Sections */}
        <text x="250" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">User Registration and Onboarding</text>
        <text x="650" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">Risk Assessment Process</text>
        
        {/* Vertical Dividing Line */}
        <line x1="450" y1="40" x2="450" y2="1050" stroke="#999" strokeWidth="1" strokeDasharray="10,5" />
        
        {/* Left Side - User Registration Flow */}
        {/* Start node */}
        <circle cx="250" cy="60" r="15" fill="#000" />
        
        {/* Registration Steps */}
        <rect x="150" y="100" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="130" textAnchor="middle" fontSize="14">Access Registration Page</text>
        
        <rect x="150" y="180" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="210" textAnchor="middle" fontSize="14">Provide Authentication Info</text>
        
        <rect x="150" y="260" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="290" textAnchor="middle" fontSize="14">System Validates Input</text>
        
        {/* Validation Decision */}
        <polygon points="250,340 290,380 250,420 210,380" fill="#fff3e0" stroke="#ef6c00" strokeWidth="2" />
        <text x="250" y="385" textAnchor="middle" fontSize="12">Valid?</text>
        
        <rect x="50" y="370" width="120" height="50" rx="10" fill="#ffebee" stroke="#c62828" strokeWidth="2" />
        <text x="110" y="400" textAnchor="middle" fontSize="14">Show Errors</text>
        
        <rect x="150" y="450" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="480" textAnchor="middle" fontSize="14">Complete Health Profile</text>
        
        <rect x="150" y="530" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="560" textAnchor="middle" fontSize="14">Calculate Initial Risk</text>
        
        <rect x="150" y="610" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="640" textAnchor="middle" fontSize="14">Generate Recommendations</text>
        
        <rect x="150" y="690" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="250" y="720" textAnchor="middle" fontSize="14">Direct to Dashboard</text>
        
        {/* End node for left side */}
        <circle cx="250" cy="770" r="15" fill="#fff" stroke="#000" strokeWidth="3" />
        <circle cx="250" cy="770" r="9" fill="#000" />
        
        {/* Left side arrows */}
        <line x1="250" y1="75" x2="250" y2="100" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="150" x2="250" y2="180" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="230" x2="250" y2="260" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="310" x2="250" y2="340" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        <line x1="210" y1="380" x2="170" y2="380" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="190" y="365" textAnchor="middle" fontSize="12">No</text>
        
        <line x1="110" y1="420" x2="110" y2="450" stroke="#333" strokeWidth="2" />
        <line x1="110" y1="450" x2="230" y2="450" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        <line x1="250" y1="420" x2="250" y2="450" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="260" y="435" textAnchor="middle" fontSize="12">Yes</text>
        
        <line x1="250" y1="500" x2="250" y2="530" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="580" x2="250" y2="610" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="660" x2="250" y2="690" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="740" x2="250" y2="755" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Right Side - Risk Assessment Process */}
        {/* Start node */}
        <circle cx="650" cy="60" r="15" fill="#000" />
        
        <rect x="550" y="100" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="130" textAnchor="middle" fontSize="14">Receive Health Data Input</text>
        
        <rect x="550" y="180" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="210" textAnchor="middle" fontSize="14">Validate Data Completeness</text>
        
        {/* Data Completeness Decision */}
        <polygon points="650,260 690,300 650,340 610,300" fill="#fff3e0" stroke="#ef6c00" strokeWidth="2" />
        <text x="650" y="305" textAnchor="middle" fontSize="12">Complete?</text>
        
        <rect x="780" y="275" width="120" height="50" rx="10" fill="#ffebee" stroke="#c62828" strokeWidth="2" />
        <text x="840" y="305" textAnchor="middle" fontSize="14">Request Missing Data</text>
        
        <rect x="550" y="370" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="400" textAnchor="middle" fontSize="14">Process Data in Algorithm</text>
        
        <rect x="550" y="450" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="480" textAnchor="middle" fontSize="14">Identify Risk Factors</text>
        
        <rect x="550" y="530" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="560" textAnchor="middle" fontSize="14">Calculate Cumulative Score</text>
        
        <rect x="550" y="610" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="640" textAnchor="middle" fontSize="14">Determine Risk Level</text>
        
        <rect x="550" y="690" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="720" textAnchor="middle" fontSize="14">Generate Recommendations</text>
        
        <rect x="550" y="770" width="200" height="50" rx="10" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
        <text x="650" y="800" textAnchor="middle" fontSize="14">Present Results to User</text>
        
        {/* End node for right side */}
        <circle cx="650" cy="850" r="15" fill="#fff" stroke="#000" strokeWidth="3" />
        <circle cx="650" cy="850" r="9" fill="#000" />
        
        {/* Right side arrows */}
        <line x1="650" y1="75" x2="650" y2="100" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="150" x2="650" y2="180" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="230" x2="650" y2="260" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        <line x1="690" y1="300" x2="780" y2="300" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="730" y="285" textAnchor="middle" fontSize="12">No</text>
        
        <line x1="840" y1="325" x2="840" y2="350" stroke="#333" strokeWidth="2" />
        <line x1="840" y1="350" x2="650" y2="350" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        <line x1="650" y1="340" x2="650" y2="370" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="630" y="355" textAnchor="middle" fontSize="12">Yes</text>
        
        <line x1="650" y1="420" x2="650" y2="450" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="500" x2="650" y2="530" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="580" x2="650" y2="610" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="660" x2="650" y2="690" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="740" x2="650" y2="770" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="820" x2="650" y2="835" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Arrow definitions */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>
      </svg>
      
      <div className="diagram-legend mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium mb-2">Diagram Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-black mr-2"></div>
            <span>Start Node</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-white border-2 border-black mr-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-black"></div>
            </div>
            <span>End Node</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-5 rounded-md bg-[#e8f5e9] border border-[#2e7d32] mr-2"></div>
            <span>Activity</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 transform rotate-45 bg-[#fff3e0] border border-[#ef6c00] mr-2"></div>
            <span>Decision</span>
          </div>
        </div>
      </div>
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