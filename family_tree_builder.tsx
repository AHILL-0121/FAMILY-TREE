import React, { useState, useRef, useCallback } from 'react';
import { Plus, Edit3, Trash2, Save, X, Users, Download, FileText } from 'lucide-react';

const FamilyTreeBuilder = () => {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Root Person',
      generation: 0,
      x: 400,
      y: 300,
      parentIds: [],
      children: [],
      spouseId: null
    }
  ]);
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [isDragging, setIsDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Auto-arrange family tree generations
  const autoArrangeGenerations = (updatedMembers) => {
    const generations = {};
    
    // Group by generation
    updatedMembers.forEach(member => {
      if (!generations[member.generation]) {
        generations[member.generation] = [];
      }
      generations[member.generation].push(member);
    });

    // Arrange each generation
    Object.keys(generations).forEach(gen => {
      const genMembers = generations[gen];
      const genNumber = parseInt(gen);
      const y = 100 + genNumber * 150;
      
      genMembers.forEach((member, index) => {
        const x = 100 + index * 180;
        member.x = x;
        member.y = y;
      });
    });

    return updatedMembers;
  };

  const addChild = (parentId) => {
    const parent = members.find(m => m.id === parentId);
    if (!parent) return;

    const newId = Math.max(...members.map(m => m.id)) + 1;
    const childrenCount = members.filter(m => m.parentIds.includes(parentId)).length;
    
    const newMember = {
      id: newId,
      name: `Child ${childrenCount + 1}`,
      generation: parent.generation + 1,
      x: parent.x + (childrenCount * 150),
      y: parent.y + 150,
      parentIds: [parentId],
      children: [],
      spouseId: null
    };

    setMembers(prev => {
      const updated = prev.map(m => 
        m.id === parentId 
          ? { ...m, children: [...m.children, newId] }
          : m
      );
      return autoArrangeGenerations([...updated, newMember]);
    });
  };

  const addParent = (childId) => {
    const child = members.find(m => m.id === childId);
    if (!child) return;

    const newId = Math.max(...members.map(m => m.id)) + 1;
    const parentCount = child.parentIds.length;
    
    const newParent = {
      id: newId,
      name: `Parent ${parentCount + 1}`,
      generation: child.generation - 1,
      x: child.x + (parentCount * 120),
      y: child.y - 150,
      parentIds: [],
      children: [childId],
      spouseId: null
    };

    setMembers(prev => {
      const updated = prev.map(m => 
        m.id === childId 
          ? { ...m, parentIds: [...m.parentIds, newId] }
          : m
      );
      
      // Update generations for all members
      const withNewParent = [...updated, newParent];
      const minGen = Math.min(...withNewParent.map(m => m.generation));
      
      // Adjust all generations to ensure no negative values
      if (minGen < 0) {
        withNewParent.forEach(m => m.generation += Math.abs(minGen));
      }
      
      return autoArrangeGenerations(withNewParent);
    });
  };

  const addSpouse = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member || member.spouseId) return; // Already has spouse

    const newId = Math.max(...members.map(m => m.id)) + 1;
    
    const newSpouse = {
      id: newId,
      name: `Spouse of ${member.name}`,
      generation: member.generation,
      x: member.x + 100,
      y: member.y,
      parentIds: [],
      children: [...member.children], // Share children
      spouseId: memberId
    };

    setMembers(prev => {
      const updated = prev.map(m => {
        if (m.id === memberId) {
          return { ...m, spouseId: newId };
        }
        // Update children to have both parents
        if (member.children.includes(m.id)) {
          return { ...m, parentIds: [...new Set([...m.parentIds, newId])] };
        }
        return m;
      });
      return [...updated, newSpouse];
    });
  };

  const deleteMember = (memberId) => {
    if (members.length === 1) return;
    
    setMembers(prev => {
      const filtered = prev.filter(m => m.id !== memberId);
      return filtered.map(m => ({
        ...m,
        children: m.children.filter(childId => childId !== memberId),
        parentIds: m.parentIds.filter(parentId => parentId !== memberId),
        spouseId: m.spouseId === memberId ? null : m.spouseId
      }));
    });
    setSelectedMember(null);
  };

  const updateMemberName = (memberId, newName) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, name: newName } : m
    ));
    setEditingMember(null);
  };

  const handleMouseDown = (e, memberId) => {
    const member = members.find(m => m.id === memberId);
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(memberId);
    setDragOffset({
      x: x - member.x,
      y: y - member.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    setMembers(prev => prev.map(m => 
      m.id === isDragging ? { ...m, x: Math.max(50, x), y: Math.max(30, y) } : m
    ));
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderConnections = () => {
    const connections = [];
    
    // Parent-child connections
    members.forEach(member => {
      member.children.forEach(childId => {
        const child = members.find(m => m.id === childId);
        if (!child) return;
        
        connections.push(
          <line
            key={`parent-${member.id}-${childId}`}
            x1={member.x}
            y1={member.y + 25}
            x2={child.x}
            y2={child.y - 25}
            stroke="#8B4513"
            strokeWidth="2"
          />
        );
      });
    });

    // Spouse connections
    members.forEach(member => {
      if (member.spouseId) {
        const spouse = members.find(m => m.id === member.spouseId);
        if (spouse && member.id < spouse.id) { // Avoid duplicate lines
          connections.push(
            <line
              key={`spouse-${member.id}-${member.spouseId}`}
              x1={member.x + 25}
              y1={member.y}
              x2={spouse.x - 25}
              y2={spouse.y}
              stroke="#FF69B4"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          );
        }
      }
    });

    return connections;
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(members, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'family_tree.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    // Create a new window with the SVG content for PDF generation
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Family Tree</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .tree-container { width: 100%; overflow: visible; }
            svg { width: 100%; height: auto; border: 1px solid #ccc; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Family Tree</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="tree-container">
            ${svgData}
          </div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print/Save as PDF
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Family Tree Builder</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportAsJSON}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={exportAsPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Tree Canvas */}
        <div className="flex-1 relative overflow-auto">
          <svg
            ref={svgRef}
            width="1400"
            height="1000"
            className="w-full h-full cursor-grab"
            style={{ minWidth: '1400px', minHeight: '1000px' }}
          >
            {/* Background */}
            <defs>
              <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#90EE90" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#treeGradient)" />
            
            {/* Connections */}
            {renderConnections()}
            
            {/* Members */}
            {members.map(member => (
              <g key={member.id}>
                {/* Member circle */}
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="30"
                  fill={selectedMember === member.id ? "#4CAF50" : "white"}
                  stroke={selectedMember === member.id ? "#2E7D32" : "#333"}
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-gray-100"
                  onMouseDown={(e) => handleMouseDown(e, member.id)}
                  onClick={() => setSelectedMember(member.id)}
                />
                
                {/* Member name */}
                <text
                  x={member.x}
                  y={member.y + 5}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-800 pointer-events-none select-none"
                >
                  {member.name.length > 10 ? `${member.name.substring(0, 10)}...` : member.name}
                </text>
                
                {/* Generation indicator */}
                <text
                  x={member.x}
                  y={member.y - 40}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 pointer-events-none"
                >
                  Gen {member.generation}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-white shadow-lg border-l overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {selectedMember ? 'Member Details' : 'Select a Member'}
            </h2>
            
            {selectedMember && (
              <div className="space-y-4">
                {(() => {
                  const member = members.find(m => m.id === selectedMember);
                  return (
                    <>
                      {/* Name editing */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        {editingMember === selectedMember ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter name"
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateMemberName(selectedMember, newMemberName);
                                }
                              }}
                            />
                            <button
                              onClick={() => updateMemberName(selectedMember, newMemberName)}
                              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingMember(null)}
                              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">
                              {member.name}
                            </span>
                            <button
                              onClick={() => {
                                setEditingMember(selectedMember);
                                setNewMemberName(member.name);
                              }}
                              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => addParent(selectedMember)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Parent
                        </button>
                        
                        <button
                          onClick={() => addChild(selectedMember)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Child
                        </button>
                        
                        <button
                          onClick={() => addSpouse(selectedMember)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                          disabled={member.spouseId !== null}
                        >
                          <Plus className="w-4 h-4" />
                          {member.spouseId ? 'Has Spouse' : 'Add Spouse'}
                        </button>
                        
                        <button
                          onClick={() => deleteMember(selectedMember)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          disabled={members.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Member
                        </button>
                      </div>

                      {/* Info */}
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                        <p><strong>Generation:</strong> {member.generation}</p>
                        <p><strong>Children:</strong> {member.children.length}</p>
                        <p><strong>Parents:</strong> {member.parentIds.length}</p>
                        <p><strong>Spouse:</strong> {member.spouseId ? 'Yes' : 'No'}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            
            {!selectedMember && (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Click on a family member to view details and add relationships.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg text-sm text-gray-600 max-w-xs">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Click members to select them</li>
          <li>Drag members to reposition</li>
          <li>Add parents, children, or spouses to any member</li>
          <li>Spouse connections shown as pink dashed lines</li>
          <li>Export as JSON or PDF</li>
        </ul>
      </div>
    </div>
  );
};

export default FamilyTreeBuilder;