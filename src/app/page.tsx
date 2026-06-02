import { redirect } from 'next/navigation'

// This component will now act as a root entry point.
// It redirects any request to the root to the /dashboard page.
export default function Home() {
    redirect('/dashboard')
}
