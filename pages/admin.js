import { useEffect } from 'react'
import { useRouter } from 'next/router'

// The admin panel now lives inside /dashboard (single unified app,
// with admin sections gated per-user by lib/permissions.js).
// This stub just forwards old bookmarks/links.
export default function AdminRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard') }, [router])
  return null
}
