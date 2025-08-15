"use client";
import { useEffect, useState, useRef } from "react";
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
}

interface FamilyTreeCanvasProps {
	members: Person[];
	onPersonSelect: (person: Person) => void;
	zoomLevel?: number;
	orientation?: 'vertical' | 'horizontal';
	onAddMember?: (personId: number, relationshipType: string) => void;
}

export default function FamilyTreeCanvas({ 
	members, 
	onPersonSelect, 
	zoomLevel = 1, 
	orientation = 'vertical',
	onAddMember 
}: FamilyTreeCanvasProps) {
	const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const canvasRef = useRef<HTMLDivElement>(null);

	const handlePersonClick = (person: Person) => {
		setSelectedPerson(person.id);
		onPersonSelect(person);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target === canvasRef.current) {
			setIsDragging(true);
			setDragStart({
				x: e.clientX - position.x,
				y: e.clientY - position.y
			});
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);
		return () => {
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mousemove', handleMouseMove);
		};
	}, [isDragging, dragStart]);

	// Organize members by generation and relationships
	const organizeMembers = () => {
		const rootMembers = members.filter(m => !m.parent_id);
		const organized: { [key: number]: Person[] } = {};
		
		// Group by generation
		members.forEach(member => {
			if (!organized[member.generation]) {
				organized[member.generation] = [];
			}
			organized[member.generation].push(member);
		});

		return { rootMembers, organized };
	};

	const { rootMembers, organized } = organizeMembers();

	// Render tree structure
	const renderTree = () => {
		const generations = Object.keys(organized).map(Number).sort((a, b) => a - b);
		
		return (
			<div 
				style={{
					transform: `scale(${zoomLevel})`,
					transformOrigin: 'center center'
				}} 
				className={`relative ${orientation === 'vertical' ? 'flex flex-col items-center' : 'flex items-center'}`}
			>
				{generations.map((gen, genIndex) => (
					<div key={gen} className={`relative ${genIndex > 0 ? 'mt-8' : ''}`}>
						<div className={`flex ${orientation === 'vertical' ? 'flex-row' : 'flex-col'} items-center space-x-4`}>
							{organized[gen].map((person, personIndex) => (
								<div key={person.id} className="relative">
									<PersonCard
										person={person}
										onClick={handlePersonClick}
										selected={selectedPerson === person.id}
										onAddMember={onAddMember}
									/>
									{/* Connection lines */}
									{person.parent_id && (
										<div className={`absolute ${orientation === 'vertical' ? 'top-0 left-1/2 transform -translate-x-1/2' : 'left-0 top-1/2 transform -translate-y-1/2'}`}>
											<div className={`${orientation === 'vertical' ? 'h-8 w-1' : 'w-8 h-1'} bg-amber-800`}></div>
										</div>
									)}
								</div>
							))}
						</div>
						{/* Generation label */}
						<div className={`absolute ${orientation === 'vertical' ? 'left-0 top-1/2 transform -translate-y-1/2' : 'top-0 left-1/2 transform -translate-x-1/2'} bg-white px-2 py-1 text-xs font-medium text-amber-800 border border-amber-800 rounded-md`}>
							Generation {gen}
						</div>
					</div>
				))}
			</div>
		);
	};

	return (
		<div 
			ref={canvasRef} 
			className="w-full h-full bg-sky-50 overflow-hidden cursor-move" 
			onMouseDown={handleMouseDown}
			style={{
				backgroundImage: 'radial-gradient(circle, rgba(226, 252, 228, 0.6) 30%, transparent 70%)',
				backgroundSize: '100px 100px',
				backgroundRepeat: 'repeat'
			}}
		>
			<div 
				className="absolute transition-transform duration-100 ease-out" 
				style={{
					transform: `translate(${position.x}px, ${position.y}px)`,
					left: '50%',
					top: '50%'
				}}
			>
				{renderTree()}
			</div>
		</div>
	);
} 