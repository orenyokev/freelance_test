'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Search } from 'lucide-react'

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

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/freelancers')
      .then(res => res.json())
      .then(data => {
        setFreelancers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredFreelancers = freelancers.filter(freelancer =>
    freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Freelancers</h1>
          <p className="mt-2 text-gray-600">Discover talented professionals</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search freelancers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredFreelancers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No freelancers found matching your search.' : 'No freelancers available yet.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <Link
                key={freelancer.id}
                href={`/freelancers/${freelancer.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-xl">
                    {freelancer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{freelancer.name}</h3>
                    <div className="flex items-center text-sm mt-1">
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
        )}
      </div>
    </div>
  )
}

