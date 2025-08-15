"use client";
import { useState, useRef } from "react";
import { UserIcon, PlusIcon, CameraIcon, EditIcon } from "lucide-react";
import AddRelationshipMenu from "@/components/AddRelationshipMenu";

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
	onUpdatePhoto?: (personId: number, photoFile: File) => void;
	onEditName?: (personId: number, newName: string) => void;
}

export default function PersonCard({ 
	person, 
	onClick, 
	selected, 
	onAddMember,
	onUpdatePhoto,
	onEditName 
}: PersonCardProps) {
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const [editName, setEditName] = useState(person.name);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && onUpdatePhoto) {
			onUpdatePhoto(person.id, file);
		}
	};

	const handleNameEdit = () => {
		setIsEditingName(true);
		setEditName(person.name);
	};

	const handleNameSave = () => {
		if (onEditName && editName.trim() !== person.name) {
			onEditName(person.id, editName.trim());
		}
		setIsEditingName(false);
	};

	const handleNameCancel = () => {
		setEditName(person.name);
		setIsEditingName(false);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleNameSave();
		} else if (e.key === 'Escape') {
			handleNameCancel();
		}
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
				{/* Photo Section */}
				<div className="relative w-20 h-20 rounded-full overflow-hidden mb-1">
					{person.photo_url ? (
						<img 
							src={person.photo_url} 
							alt={person.name} 
							className="w-full h-full object-cover" 
						/>
					) : (
						<div className="w-full h-full bg-gray-200 flex items-center justify-center">
							<UserIcon size={30} className="text-gray-400" />
						</div>
					)}
					
					{/* Photo Upload Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							fileInputRef.current?.click();
						}}
						className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full"
						title="Change photo"
					>
						<CameraIcon size={20} className="text-white" />
					</button>
				</div>

				{/* Name Section */}
				<div className="text-center mt-1 px-2 w-full">
					{isEditingName ? (
						<div className="flex items-center justify-center space-x-1">
							<input
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								onKeyDown={handleKeyPress}
								onBlur={handleNameSave}
								className="text-sm font-medium text-black bg-transparent border-b border-emerald-500 focus:outline-none text-center w-20"
								autoFocus
							/>
						</div>
					) : (
						<div className="flex items-center justify-center space-x-1">
							<div className="font-medium text-sm truncate max-w-full text-black">
								{person.name}
							</div>
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleNameEdit();
								}}
								className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-emerald-100 rounded"
								title="Edit name"
							>
								<EditIcon size={12} className="text-emerald-600" />
							</button>
						</div>
					)}
					
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

			{/* Add Member Button */}
			{selected && (
				<button 
					className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md hover:bg-emerald-600" 
					onClick={toggleAddMenu} 
					title="Add family member"
				>
					<PlusIcon size={16} />
				</button>
			)}

			{/* Relationship Menu */}
			{showAddMenu && selected && (
				<AddRelationshipMenu 
					person={person} 
					onClose={handleAddMenuClose}
					onAddMember={handleAddMember}
				/>
			)}

			{/* Hidden File Input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handlePhotoUpload}
				className="hidden"
			/>
		</div>
	);
} 