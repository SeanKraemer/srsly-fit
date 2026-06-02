'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Props {
    href: string
    children: React.ReactNode | string
}

export default function GenericCard({ href, children }: Props) {
    const [active, setActive] = useState(false)

    return (
        <Link
            href={href}
            prefetch={active ? null : false}
            className='p-4 h-32 text-center hover:cursor-pointer active:scale-95 rounded flex flex-col justify-center'
            onMouseEnter={() => setActive(true)}
        >
            {children}
        </Link>
    )
}
