"use client";
import { useState } from "react";
import { UserIcon, PlusIcon } from "lucide-react";
import AddRelationshipMenu from "./AddRelationshipMenu";

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

interface PersonCardProps {
	person: Person;
	onClick: (person: Person) => void;
	selected: boolean;
	onAddMember?: (personId: number, relationshipType: string) => void;
}

export default function PersonCard({ person, onClick, selected, onAddMember }: PersonCardProps) {
	const [showAddMenu, setShowAddMenu] = useState(false);

	const handleClick = () => {
		onClick(person);
	};

	const toggleAddMenu = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowAddMenu(!showAddMenu);
	};

	const handleAddMenuClose = () => {
		setShowAddMenu(false);
	};

	const handleAddMember = (relationshipType: string) => {
		if (onAddMember) {
			onAddMember(person.id, relationshipType);
		}
		setShowAddMenu(false);
	};

	return (
		<div className="relative">
			<div
				className={`
					flex flex-col items-center justify-center
					w-36 h-36 rounded-full bg-white border-2
					${selected ? 'border-emerald-500' : 'border-emerald-300'}
					shadow-md cursor-pointer transition-transform transform
					hover:shadow-lg hover:scale-105
				`}
				onClick={handleClick}
			>
				{person.photo_url ? (
					<div className="w-20 h-20 rounded-full overflow-hidden mb-1">
						<img 
							src={person.photo_url} 
							alt={person.name} 
							className="w-full h-full object-cover" 
						/>
					</div>
				) : (
					<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-1">
						<UserIcon size={30} className="text-gray-400" />
					</div>
				)}
				<div className="text-center mt-1 px-2">
					<div className="font-medium text-sm truncate max-w-full text-black">
						{person.name}
					</div>
					{person.birth_year && (
						<div className="text-xs text-gray-500">
							{person.birth_year}
							{person.death_year ? ` - ${person.death_year}` : ''}
						</div>
					)}
					<div className="text-xs text-emerald-600 font-medium">
						Gen {person.generation}
					</div>
				</div>
			</div>
			{selected && (
				<button 
					className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md hover:bg-emerald-600" 
					onClick={toggleAddMenu} 
					title="Add family member"
				>
					<PlusIcon size={16} />
				</button>
			)}
			{showAddMenu && selected && (
				<AddRelationshipMenu 
					person={person} 
					onClose={handleAddMenuClose}
					onAddMember={handleAddMember}
				/>
			)}
		</div>
	);
} 