"use client";
import { useState } from "react";
import { UserIcon, EditIcon, SaveIcon, XIcon, TrashIcon } from "lucide-react";

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

interface PersonDetailsPanelProps {
	person: Person | null;
	onUpdatePerson: (personId: number, updates: Partial<Person>) => void;
	onDeletePerson: (personId: number) => void;
}

export default function PersonDetailsPanel({ person, onUpdatePerson, onDeletePerson }: PersonDetailsPanelProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState<Partial<Person>>({});

	if (!person) {
		return (
			<div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6">
				<div className="text-center text-gray-500">
					<UserIcon size={48} className="mx-auto mb-4 text-gray-300" />
					<p className="text-lg font-medium">No person selected</p>
					<p className="text-sm">Click on a family member to view details</p>
				</div>
			</div>
		);
	}

	const handleEdit = () => {
		setEditData({
			name: person.name,
			birth_year: person.birth_year,
			death_year: person.death_year
		});
		setIsEditing(true);
	};

	const handleSave = () => {
		onUpdatePerson(person.id, editData);
		setIsEditing(false);
		setEditData({});
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditData({});
	};

	const handleDelete = () => {
		if (confirm(`Are you sure you want to delete ${person.name}?`)) {
			onDeletePerson(person.id);
		}
	};

	return (
		<div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold text-gray-800">Person Details</h2>
				<div className="flex space-x-2">
					{!isEditing ? (
						<>
							<button
								onClick={handleEdit}
								className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
								title="Edit person"
							>
								<EditIcon size={16} />
							</button>
							<button
								onClick={handleDelete}
								className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
								title="Delete person"
							>
								<TrashIcon size={16} />
							</button>
						</>
					) : (
						<>
							<button
								onClick={handleSave}
								className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md"
								title="Save changes"
							>
								<SaveIcon size={16} />
							</button>
							<button
								onClick={handleCancel}
								className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
								title="Cancel editing"
							>
								<XIcon size={16} />
							</button>
						</>
					)}
				</div>
			</div>

			<div className="space-y-6">
				{/* Photo */}
				<div className="text-center">
					{person.photo_url ? (
						<img
							src={person.photo_url}
							alt={person.name}
							className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
						/>
					) : (
						<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
							<UserIcon size={32} className="text-gray-400" />
						</div>
					)}
				</div>

				{/* Name */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
					{isEditing ? (
						<input
							type="text"
							value={editData.name || ''}
							onChange={(e) => setEditData({ ...editData, name: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
					) : (
						<p className="text-lg font-medium text-gray-900">{person.name}</p>
					)}
				</div>

				{/* Generation */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Generation</label>
					<p className="text-lg text-emerald-600 font-medium">Generation {person.generation}</p>
				</div>

				{/* Birth Year */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Birth Year</label>
					{isEditing ? (
						<input
							type="text"
							value={editData.birth_year || ''}
							onChange={(e) => setEditData({ ...editData, birth_year: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
							placeholder="e.g., 1990"
						/>
					) : (
						<p className="text-gray-900">{person.birth_year || 'Not specified'}</p>
					)}
				</div>

				{/* Death Year */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Death Year</label>
					{isEditing ? (
						<input
							type="text"
							value={editData.death_year || ''}
							onChange={(e) => setEditData({ ...editData, death_year: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
							placeholder="e.g., 2020"
						/>
					) : (
						<p className="text-gray-900">{person.death_year || 'Not specified'}</p>
					)}
				</div>

				{/* Relationships */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Relationships</label>
					<div className="space-y-2">
						{person.parent_id && (
							<p className="text-sm text-gray-600">Has parent (ID: {person.parent_id})</p>
						)}
						{person.spouse_id && (
							<p className="text-sm text-gray-600">Has spouse (ID: {person.spouse_id})</p>
						)}
						{!person.parent_id && !person.spouse_id && (
							<p className="text-sm text-gray-500">No relationships defined</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
} 