'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SmartPrefetchLink({ href, className }: { href: string, className?: string }) {
    const [active, setActive] = useState(false)

    const rawText = href.slice(1) || "home";
    const linkText = rawText.charAt(0).toUpperCase() + rawText.slice(1);

    return (
        <Link
            href={href}
            prefetch={active ? null : false}
            onMouseEnter={() => {setActive(true)}}
            className={`px-4 flex h-full items-center justify-center font-bold hover:cursor-pointer hover:underline ${className || ''}`}
        >
            {linkText}
        </Link>
    )
}
