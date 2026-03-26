import { redirect } from 'next/navigation'

// Root redirects to /home — middleware handles auth gating
export default function RootPage() {
  redirect('/home')
}
