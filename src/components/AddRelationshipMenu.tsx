"use client";
import { useEffect, useRef } from "react";
import { UserPlusIcon, UsersIcon, HeartIcon } from "lucide-react";

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

interface AddRelationshipMenuProps {
	person: Person;
	onClose: () => void;
	onAddMember: (relationshipType: string) => void;
}

export default function AddRelationshipMenu({ person, onClose, onAddMember }: AddRelationshipMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onClose]);

	const handleRelationshipSelect = (type: string) => {
		onAddMember(type);
	};

	return (
		<div 
			ref={menuRef} 
			className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-lg py-2 z-10 w-48"
		>
			<div className="px-3 py-1.5 text-sm font-medium text-gray-700 border-b">
				Add family member
			</div>
			<button 
				className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100" 
				onClick={() => handleRelationshipSelect('child')}
			>
				<UserPlusIcon size={16} className="mr-2 text-emerald-500" />
				<span>Add Child</span>
			</button>
			<button 
				className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100" 
				onClick={() => handleRelationshipSelect('parent')}
			>
				<UserPlusIcon size={16} className="mr-2 text-blue-500" />
				<span>Add Parent</span>
			</button>
			<button 
				className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100" 
				onClick={() => handleRelationshipSelect('sibling')}
			>
				<UsersIcon size={16} className="mr-2 text-purple-500" />
				<span>Add Sibling</span>
			</button>
			<button 
				className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100" 
				onClick={() => handleRelationshipSelect('spouse')}
			>
				<HeartIcon size={16} className="mr-2 text-red-500" />
				<span>Add Spouse</span>
			</button>
		</div>
	);
} 