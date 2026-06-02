'use client'

import { useState } from 'react'
import Link from 'next/link';

interface Props {
    href: string;
    workoutId?: number;
    exerciseId?: number;
    userId: number;
    deleteRoute: string;
    buttonBgClass?: string;
    title?: string;
    children: React.ReactNode | string;
}

export default function DeleteCard({ href, workoutId, exerciseId, userId, deleteRoute, children, buttonBgClass = 'bg-blue-700', title = 'Delete item' }: Props) {
    const [active, setActive] = useState(false)
    const [visible, setVisible] = useState(true)
    const [disabled, setDisabled] = useState(false)

    // Hide the card locally and send deletion command to server
    const handleDelete = async (event: React.MouseEvent) => {
        event.preventDefault(); 
        event.stopPropagation();
        setDisabled(true);

        const body: { userId: number, workoutId?: number, exerciseId?: number } = { userId };
        if (workoutId) {
            body.workoutId = workoutId;
        }
        if (exerciseId) {
            body.exerciseId = exerciseId;
        }

        const result = await fetch(
            deleteRoute, 
            { method: 'DELETE', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });

        if (!result.ok) {
            const error = await result.json()
            alert(error?.message || 'Failed to delete item')
            setDisabled(false)
            return
        }

        setVisible(false);
    };

    if (!visible) return null;

    return (
    <div className="relative rounded">
        <Link
            href={href}
            prefetch={active ? null : false}
            className="p-4 h-32 text-center hover:cursor-pointer active:scale-95 rounded block flex flex-col justify-center"
            onMouseEnter={() => setActive(true)}
        >
            {children}
        </Link>

      <button
        onClick={handleDelete}
          title={title}
          disabled={disabled}
        className={`absolute top-2 right-2 z-10 text-red-300 hover:text-red-500 font-bold px-2 py-1 rounded ${buttonBgClass}`}
      >
        x
      </button>
    </div>
  );
}
