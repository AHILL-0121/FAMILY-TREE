"use client";
import Link from "next/link";
import { FolderTreeIcon } from "lucide-react";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
					<div className="flex items-center">
						<FolderTreeIcon size={32} className="text-emerald-600 mr-2" />
						<span className="text-2xl font-bold text-emerald-600">FamilyTree</span>
					</div>
					<div>
						<Link href="/dashboard" className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
							Get Started
						</Link>
					</div>
				</div>
			</header>
			<main>
				<section className="bg-gradient-to-b from-white to-emerald-50 py-16 sm:py-24">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
							Discover Your Family History
						</h1>
						<p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
							Create beautiful family trees, track relationships, and preserve your family's legacy for generations to come.
						</p>
						<div className="mt-10 flex justify-center">
							<Link href="/dashboard" className="px-8 py-3 bg-emerald-600 text-white rounded-md text-lg font-medium hover:bg-emerald-700">
								Start Your Family Tree
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
