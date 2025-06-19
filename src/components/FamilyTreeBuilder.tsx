"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Edit3, Trash2, Save, X, Users, Download, FileText } from "lucide-react";
import { apiFetch } from '../utils/api';

export default function FamilyTreeBuilder({ treeId }: { treeId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to recalculate generations
  const recalculateGenerations = (membersList: any[]) => {
    // Find root nodes (members with no parents)
    const roots = membersList.filter(m => !m.parentIds || m.parentIds.split(',').filter(Boolean).length === 0);
    const updatedMembers = [...membersList];
    const visited = new Set();

    // BFS from each root
    for (const root of roots) {
      const queue: { member: any; gen: number }[] = [{ member: root, gen: 0 }];
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) continue;
        const { member, gen } = item;
        if (visited.has(member.id)) continue;
        visited.add(member.id);
        // Update generation if changed
        const idx = updatedMembers.findIndex(m => m.id === member.id);
        if (idx !== -1 && updatedMembers[idx].generation !== gen) {
          updatedMembers[idx] = { ...updatedMembers[idx], generation: gen };
        }
        // Enqueue children
        const children = member.children ? member.children.split(',').filter(Boolean).map(Number) : [];
        for (const childId of children) {
          const child = updatedMembers.find(m => m.id === childId);
          if (child) {
            queue.push({ member: child, gen: gen + 1 });
          }
        }
        // Enqueue spouse (same generation)
        if (member.spouseId) {
          const spouse = updatedMembers.find(m => m.id === member.spouseId);
          if (spouse) {
            queue.push({ member: spouse, gen });
          }
        }
      }
    }
    return updatedMembers;
  };

  // Fetch members from backend
  const fetchMembers = async () => {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members`);
    if (res && res.ok) {
      let fetched = await res.json();
      const recalculated = recalculateGenerations(fetched);
      setMembers(recalculated);
      // Optionally, persist generation updates to backend
      for (const m of recalculated) {
        const orig = fetched.find((x: any) => x.id === m.id);
        if (orig && orig.generation !== m.generation) {
          await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members/${m.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...m, generation: m.generation }),
          });
        }
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [treeId]);

  // Helper to update member in DB
  const updateMember = async (id: number, update: any) => {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    fetchMembers();
  };

  // Helper to create member in DB
  const createMember = async (member: any) => {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    fetchMembers();
  };

  // Helper to delete member in DB
  const deleteMember = async (id: number) => {
    await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members/${id}`, { method: "DELETE" });
    setSelectedMember(null);
    fetchMembers();
  };

  // Drag logic
  const handleMouseDown = (e: React.MouseEvent, memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!svgRef.current || !member) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(memberId);
    setDragOffset({ x: x - member.x, y: y - member.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      const member = members.find((m) => m.id === isDragging);
      if (!member) return;
      updateMember(isDragging, { ...member, x: Math.max(50, x), y: Math.max(30, y) });
    },
    [isDragging, dragOffset, members]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add/Update logic
  const handleAddChild = async (parent: any) => {
    const children = parent.children ? parent.children.split(",").filter(Boolean).map(Number) : [];
    const newId = Math.max(0, ...members.map((m) => m.id)) + 1;
    const newMember = {
      id: newId,
      name: `Child ${children.length + 1}`,
      generation: parent.generation + 1,
      x: parent.x + (children.length * 150),
      y: parent.y + 150,
      parentIds: `${parent.id}`,
      children: "",
      spouseId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createMember(newMember);
    await updateMember(parent.id, { ...parent, children: [...children, newId].join(",") });
  };

  const handleAddParent = async (child: any) => {
    const parentIds = child.parentIds ? child.parentIds.split(",").filter(Boolean).map(Number) : [];
    const newId = Math.max(0, ...members.map((m) => m.id)) + 1;
    const newParent = {
      id: newId,
      name: `Parent ${parentIds.length + 1}`,
      generation: child.generation - 1,
      x: child.x + (parentIds.length * 120),
      y: child.y - 150,
      parentIds: "",
      children: `${child.id}`,
      spouseId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createMember(newParent);
    await updateMember(child.id, { ...child, parentIds: [...parentIds, newId].join(",") });
  };

  const handleAddSpouse = async (member: any) => {
    if (member.spouseId) return;
    const newId = Math.max(0, ...members.map((m) => m.id)) + 1;
    const newSpouse = {
      id: newId,
      name: `Spouse of ${member.name}`,
      generation: member.generation,
      x: member.x + 100,
      y: member.y,
      parentIds: "",
      children: member.children,
      spouseId: member.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createMember(newSpouse);
    await updateMember(member.id, { ...member, spouseId: newId });
  };

  // Export as JSON
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(members, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "family_tree.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as PDF (print SVG)
  const exportAsPDF = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
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

  // Render connections
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    members.forEach((member) => {
      // Children
      const children = member.children ? member.children.split(",").filter(Boolean).map(Number) : [];
      children.forEach((childId: number) => {
        const child = members.find((m) => m.id === childId);
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
      // Spouse
      if (member.spouseId) {
        const spouse = members.find((m) => m.id === member.spouseId);
        if (spouse && member.id < spouse.id) {
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

  // UI
  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-black">Family Tree Builder</h1>
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
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Logout
          </button>
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
            style={{ minWidth: "1400px", minHeight: "1000px" }}
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
            {members.map((member) => (
              <g key={member.id}>
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="30"
                  fill={selectedMember === member.id ? "#4CAF50" : "white"}
                  stroke={selectedMember === member.id ? "#2E7D32" : "#333"}
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-gray-100"
                  onMouseDown={(e) => handleMouseDown(e, member.id)}
                  onClick={() => {
                    setSelectedMember(member.id);
                    setEditingMember(member.id);
                    setNewMemberName(member.name);
                  }}
                />
                <text
                  x={member.x}
                  y={member.y + 5}
                  textAnchor="middle"
                  className="text-xs font-medium fill-black pointer-events-none select-none"
                >
                  {member.name.length > 10 ? `${member.name.substring(0, 10)}...` : member.name}
                </text>
                <text
                  x={member.x}
                  y={member.y - 40}
                  textAnchor="middle"
                  className="text-xs fill-black pointer-events-none"
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
            <h2 className="text-lg font-semibold mb-4 text-black">
              {selectedMember ? 'Member Details' : 'Select a Member'}
            </h2>
            {selectedMember && (() => {
              const member = members.find((m) => m.id === selectedMember);
              if (!member) return null;
              return (
                <div className="space-y-4">
                  {/* Name editing */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Name</label>
                    {editingMember === selectedMember ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-black"
                          placeholder="Enter name"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              updateMember(selectedMember, { ...member, name: newMemberName });
                              setEditingMember(null);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            updateMember(selectedMember, { ...member, name: newMemberName });
                            setEditingMember(null);
                          }}
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
                        <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-black">{member.name}</span>
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
                      onClick={() => handleAddParent(member)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Parent
                    </button>
                    <button
                      onClick={() => handleAddChild(member)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Child
                    </button>
                    <button
                      onClick={() => handleAddSpouse(member)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      disabled={!!member.spouseId}
                    >
                      <Plus className="w-4 h-4" />
                      {member.spouseId ? "Has Spouse" : "Add Spouse"}
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      disabled={members.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Member
                    </button>
                  </div>
                  {/* Info */}
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-black">
                    <p><strong>Generation:</strong> {member.generation}</p>
                    <p><strong>Children:</strong> {member.children ? member.children.split(",").filter(Boolean).length : 0}</p>
                    <p><strong>Parents:</strong> {member.parentIds ? member.parentIds.split(",").filter(Boolean).length : 0}</p>
                    <p><strong>Spouse:</strong> {member.spouseId ? "Yes" : "No"}</p>
                  </div>
                </div>
              );
            })()}
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
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg text-sm text-black max-w-xs">
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
} 