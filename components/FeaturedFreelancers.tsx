'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface Freelancer {
  id: string
  name: string
  bio: string | null
  rating: number
  totalProjects: number
  offerings: {
    id: string
    title: string
    price: number
  }[]
}

export default function FeaturedFreelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/freelancers?featured=true')
      .then(res => res.json())
      .then(data => {
        setFreelancers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (freelancers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No featured freelancers available yet.
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {freelancers.map((freelancer) => (
        <Link
          key={freelancer.id}
          href={`/freelancers/${freelancer.id}`}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg">
              {freelancer.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-900">{freelancer.name}</h3>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-gray-600">{freelancer.rating.toFixed(1)}</span>
                <span className="text-gray-400 ml-2">({freelancer.totalProjects} projects)</span>
              </div>
            </div>
          </div>
          {freelancer.bio && (
            <p className="text-gray-600 mb-4 line-clamp-2">{freelancer.bio}</p>
          )}
          {freelancer.offerings.length > 0 && (
            <div className="text-sm text-primary-600 font-medium">
              Starting at ${freelancer.offerings[0].price}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

