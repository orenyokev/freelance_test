'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(console.error)
    }
  }, [session])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-2xl">
              {session.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{session.user?.name}</h1>
              <p className="text-gray-600">{session.user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded">
                {session.user?.role}
              </span>
            </div>
          </div>

          {profile && (
            <div className="mt-8 space-y-4">
              {profile.bio && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Bio</h2>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
              {profile.skills && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Skills</h2>
                  <p className="text-gray-700">{profile.skills}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

