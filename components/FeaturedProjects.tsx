'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Calendar, DollarSign } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  budget: number
  deadline: string | null
  status: string
  customer: {
    name: string
  }
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects?featured=true')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No featured projects available. Be the first to post one!
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-900">{project.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatCurrency(project.budget)}
            </div>
            {project.deadline && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(project.deadline).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">by {project.customer.name}</div>
        </Link>
      ))}
    </div>
  )
}

