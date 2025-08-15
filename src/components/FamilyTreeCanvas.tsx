"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import PersonCard from "@/components/PersonCard";

interface Person {
	id: number;
	name: string;
	generation: number;
	parent_id?: number;
	spouse_id?: number;
	photo_url?: string;
	birth_year?: string;
	death_year?: string;
	x?: number;
	y?: number;
}

interface FamilyTreeCanvasProps {
	members: Person[];
	onPersonSelect: (person: Person) => void;
	zoomLevel?: number;
	orientation?: 'vertical' | 'horizontal';
	onAddMember?: (personId: number, relationshipType: string) => void;
	onUpdatePhoto?: (personId: number, photoFile: File) => void;
	onEditName?: (personId: number, newName: string) => void;
	onUpdatePosition?: (personId: number, x: number, y: number) => void;
}

export default function FamilyTreeCanvas({ 
	members, 
	onPersonSelect, 
	zoomLevel = 1, 
	orientation = 'vertical',
	onAddMember,
	onUpdatePhoto,
	onEditName,
	onUpdatePosition
}: FamilyTreeCanvasProps) {
	const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
	const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
	const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [draggedNode, setDraggedNode] = useState<number | null>(null);
	const [nodePositions, setNodePositions] = useState<{ [key: number]: { x: number, y: number } }>({});
	const canvasRef = useRef<HTMLDivElement>(null);

	// Initialize node positions if they don't exist
	useEffect(() => {
		const newPositions: { [key: number]: { x: number, y: number } } = {};
		members.forEach((member, index) => {
			if (member.x !== undefined && member.y !== undefined) {
				newPositions[member.id] = { x: member.x, y: member.y };
			} else {
				// Auto-layout if no position exists
				const gen = member.generation;
				const genMembers = members.filter(m => m.generation === gen);
				const genIndex = genMembers.findIndex(m => m.id === member.id);
				newPositions[member.id] = {
					x: 400 + (genIndex - genMembers.length / 2) * 200,
					y: 200 + gen * 250
				};
			}
		});
		setNodePositions(newPositions);
	}, [members]);

	const handlePersonClick = (person: Person) => {
		setSelectedPerson(person.id);
		onPersonSelect(person);
	};

	const handleCanvasMouseDown = (e: React.MouseEvent) => {
		if (e.target === canvasRef.current) {
			setIsDraggingCanvas(true);
			setDragStart({
				x: e.clientX - canvasPosition.x,
				y: e.clientY - canvasPosition.y
			});
		}
	};

	const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
		if (isDraggingCanvas) {
			setCanvasPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			});
		}
	}, [isDraggingCanvas, dragStart]);

	const handleCanvasMouseUp = () => {
		setIsDraggingCanvas(false);
	};

	const handleNodeMouseDown = (e: React.MouseEvent, personId: number) => {
		e.stopPropagation();
		setDraggedNode(personId);
		setDragStart({
			x: e.clientX - (nodePositions[personId]?.x || 0),
			y: e.clientY - (nodePositions[personId]?.y || 0)
		});
	};

	const handleNodeMouseMove = useCallback((e: MouseEvent) => {
		if (draggedNode && onUpdatePosition) {
			const newX = e.clientX - dragStart.x;
			const newY = e.clientY - dragStart.y;
			
			setNodePositions(prev => ({
				...prev,
				[draggedNode]: { x: newX, y: newY }
			}));
		}
	}, [draggedNode, dragStart, onUpdatePosition]);

	const handleNodeMouseUp = () => {
		if (draggedNode && onUpdatePosition) {
			const finalPosition = nodePositions[draggedNode];
			if (finalPosition) {
				onUpdatePosition(draggedNode, finalPosition.x, finalPosition.y);
			}
		}
		setDraggedNode(null);
	};

	useEffect(() => {
		document.addEventListener('mouseup', handleCanvasMouseUp);
		document.addEventListener('mousemove', handleCanvasMouseMove);
		document.addEventListener('mouseup', handleNodeMouseUp);
		document.addEventListener('mousemove', handleNodeMouseMove);
		
		return () => {
			document.removeEventListener('mouseup', handleCanvasMouseUp);
			document.removeEventListener('mousemove', handleCanvasMouseMove);
			document.removeEventListener('mouseup', handleNodeMouseUp);
			document.removeEventListener('mousemove', handleNodeMouseMove);
		};
	}, [handleCanvasMouseMove, handleNodeMouseMove]);

	// Render connection lines between related nodes
	const renderConnections = () => {
		const connections: React.JSX.Element[] = [];
		
		members.forEach(member => {
			const startPos = nodePositions[member.id];
			if (!startPos) return;

			// Parent-child connections
			if (member.parent_id) {
				const parentPos = nodePositions[member.parent_id];
				if (parentPos) {
					connections.push(
						<svg
							key={`parent-${member.id}`}
							className="absolute inset-0 pointer-events-none"
							style={{ zIndex: 1 }}
						>
							<line
								x1={parentPos.x}
								y1={parentPos.y + 68} // Bottom of parent node
								x2={startPos.x}
								y2={startPos.y - 68} // Top of child node
								stroke="#92400e"
								strokeWidth="2"
								markerEnd="url(#arrowhead)"
							/>
						</svg>
					);
				}
			}

			// Spouse connections
			if (member.spouse_id && member.id < member.spouse_id) {
				const spousePos = nodePositions[member.spouse_id];
				if (spousePos) {
					connections.push(
						<svg
							key={`spouse-${member.id}-${member.spouse_id}`}
							className="absolute inset-0 pointer-events-none"
							style={{ zIndex: 1 }}
						>
							<line
								x1={startPos.x + 68} // Right of first spouse
								y1={startPos.y}
								x2={spousePos.x - 68} // Left of second spouse
								y2={spousePos.y}
								stroke="#dc2626"
								strokeWidth="2"
								strokeDasharray="5,5"
							/>
						</svg>
					);
				}
			}
		});

		return connections;
	};

	// Render individual nodes
	const renderNodes = () => {
		return members.map(member => {
			const position = nodePositions[member.id];
			if (!position) return null;

			return (
				<div
					key={member.id}
					className="absolute"
					style={{
						left: position.x - 72, // Center the node (144/2)
						top: position.y - 72,
						zIndex: draggedNode === member.id ? 10 : 2
					}}
					onMouseDown={(e) => handleNodeMouseDown(e, member.id)}
				>
					<PersonCard
						person={member}
						onClick={handlePersonClick}
						selected={selectedPerson === member.id}
						onAddMember={onAddMember}
						onUpdatePhoto={onUpdatePhoto}
						onEditName={onEditName}
					/>
				</div>
			);
		});
	};

	return (
		<div 
			ref={canvasRef} 
			className="w-full h-full bg-sky-50 overflow-hidden cursor-move relative" 
			onMouseDown={handleCanvasMouseDown}
			style={{
				backgroundImage: 'radial-gradient(circle, rgba(226, 252, 228, 0.6) 30%, transparent 70%)',
				backgroundSize: '100px 100px',
				backgroundRepeat: 'repeat'
			}}
		>
			{/* SVG Definitions for arrow markers */}
			<svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
				<defs>
					<marker
						id="arrowhead"
						markerWidth="10"
						markerHeight="7"
						refX="9"
						refY="3.5"
						orient="auto"
					>
						<polygon points="0 0, 10 3.5, 0 7" fill="#92400e" />
					</marker>
				</defs>
			</svg>

			{/* Connection Lines */}
			{renderConnections()}

			{/* Nodes */}
			<div 
				className="absolute transition-transform duration-100 ease-out" 
				style={{
					transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
					left: '50%',
					top: '50%'
				}}
			>
				{renderNodes()}
			</div>

			{/* Generation Labels */}
			{Object.keys(nodePositions).length > 0 && (
				<div className="absolute top-4 left-4 space-y-2">
					{Array.from(new Set(members.map(m => m.generation))).sort().map(gen => (
						<div key={gen} className="bg-white px-3 py-1 rounded-full shadow-md border border-emerald-200">
							<span className="text-sm font-medium text-emerald-700">Generation {gen}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
} 