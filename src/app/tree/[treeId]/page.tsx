"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, FileText, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import FamilyTreeCanvas from "../../../components/FamilyTreeCanvas";
import PersonDetailsPanel from "../../../components/PersonDetailsPanel";

interface Person {
	id: number;
	name: string;
	generation: number;
	parent_id?: number;
	spouse_id?: number;
	photo_url?: string;
	birth_year?: string;
	death_year?: string;
}

export default function TreePage() {
	const params = useParams();
	const treeId = params.treeId as string;
	
	const [members, setMembers] = useState<Person[]>([]);
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
	const [loading, setLoading] = useState(true);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');

	useEffect(() => {
		if (treeId) {
			fetchMembers();
		}
	}, [treeId]);

	async function fetchMembers() {
		try {
			const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members`);
			if (res && res.ok) {
				const data = await res.json();
				setMembers(data);
			}
		} catch (error) {
			console.error("Failed to fetch members:", error);
		} finally {
			setLoading(false);
		}
	}

	async function handleUpdatePerson(personId: number, updates: Partial<Person>) {
		try {
			const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members/${personId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});
			
			if (res && res.ok) {
				// Update local state
				setMembers(prev => prev.map(member => 
					member.id === personId ? { ...member, ...updates } : member
				));
				
				// Update selected person if it's the one being edited
				if (selectedPerson && selectedPerson.id === personId) {
					setSelectedPerson(prev => prev ? { ...prev, ...updates } : null);
				}
			}
		} catch (error) {
			console.error("Failed to update person:", error);
		}
	}

	async function handleDeletePerson(personId: number) {
		try {
			const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members/${personId}`, {
				method: 'DELETE'
			});
			
			if (res && res.ok) {
				setMembers(prev => prev.filter(member => member.id !== personId));
				if (selectedPerson && selectedPerson.id === personId) {
					setSelectedPerson(null);
				}
			}
		} catch (error) {
			console.error("Failed to delete person:", error);
		}
	}

	async function handleAddMember(parentId: number, relationshipType: string) {
		const newPersonName = prompt(`Enter name for new ${relationshipType}:`);
		if (!newPersonName) return;

		try {
			const memberData: any = {
				name: newPersonName,
				tree_id: parseInt(treeId)
			};

			// Set parent_id for child, sibling, or spouse relationships
			if (relationshipType === 'child' || relationshipType === 'sibling') {
				memberData.parent_id = parentId;
			} else if (relationshipType === 'spouse') {
				memberData.spouse_id = parentId;
			}

			const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees/${treeId}/members`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(memberData)
			});
			
			if (res && res.ok) {
				const newMember = await res.json();
				setMembers(prev => [...prev, newMember]);
			}
		} catch (error) {
			console.error("Failed to add member:", error);
		}
	}

	const handleExportJSON = () => {
		const data = {
			treeId: parseInt(treeId),
			members: members,
			exportedAt: new Date().toISOString()
		};
		
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `family-tree-${treeId}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleExportPDF = () => {
		// Simple PDF export - in a real app you'd use a library like jsPDF
		alert("PDF export functionality would be implemented here");
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading family tree...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-md px-4 py-3">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center space-x-4">
						<h1 className="text-xl font-semibold text-gray-800">Family Tree</h1>
						<span className="text-sm text-gray-500">Tree ID: {treeId}</span>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
							className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
							title="Zoom out"
						>
							<ZoomOut size={18} />
						</button>
						<span className="text-sm text-gray-600 min-w-[60px] text-center">
							{Math.round(zoomLevel * 100)}%
						</span>
						<button
							onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
							className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
							title="Zoom in"
						>
							<ZoomIn size={18} />
						</button>
						<button
							onClick={() => setOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
							className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
							title="Toggle orientation"
						>
							<RotateCcw size={18} />
						</button>
						<button
							onClick={handleExportJSON}
							className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
						>
							<Download size={16} className="mr-2" />
							Export JSON
						</button>
						<button
							onClick={handleExportPDF}
							className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
						>
							<FileText size={16} className="mr-2" />
							Export PDF
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="flex h-[calc(100vh-80px)]">
				{/* Tree Canvas */}
				<div className="flex-1 relative">
					<FamilyTreeCanvas
						members={members}
						onPersonSelect={setSelectedPerson}
						zoomLevel={zoomLevel}
						orientation={orientation}
						onAddMember={handleAddMember}
					/>
				</div>

				{/* Person Details Panel */}
				<PersonDetailsPanel
					person={selectedPerson}
					onUpdatePerson={handleUpdatePerson}
					onDeletePerson={handleDeletePerson}
				/>
			</div>
		</div>
	);
} 