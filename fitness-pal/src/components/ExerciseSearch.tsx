"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of a single muscle object
export interface Muscle {
    muscleId: number;
    name: string;
}

// Update the component's props
interface ExerciseSearchProps {
    initialSearchTerm: string;
    initialSelectedMuscle: string;
    muscles: Muscle[];
}

export default function ExerciseSearch({ 
    initialSearchTerm, 
    initialSelectedMuscle, 
    muscles 
}: ExerciseSearchProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    // Add state for the selected muscle
    const [selectedMuscle, setSelectedMuscle] = useState(initialSelectedMuscle);
    const router = useRouter();

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        // Use URLSearchParams to easily construct the query string
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }
        if (selectedMuscle) {
            params.set('muscle', selectedMuscle);
        }
        
        router.push(`/exercises?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearchSubmit} className="w-full flex justify-center items-center gap-2">
            {/* The dropdown menu for muscles */}
            <select 
                value={selectedMuscle} 
                onChange={(e) => setSelectedMuscle(e.target.value)}
                className="bg-white rounded-md border border-gray-300 text-black px-2 py-2 text-sm"
            >
                <option value="">All Muscles</option>
                {muscles.map((muscle) => (
                    <option key={muscle.muscleId} value={muscle.muscleId}>
                        {muscle.name}
                    </option>
                ))}
            </select>

            <div className="relative w-1/3">
                <label htmlFor="exercise-search" className="sr-only">Search exercises</label>
                <input
                    id="exercise-search"
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 text-sm text-black outline-2 placeholder:text-gray-500"
                />
                <div className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
            </div>
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Search
            </button>
        </form>
    );
}