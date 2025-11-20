'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Calendar, DollarSign, User, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Project {
  id: string
  title: string
  description: string
  budget: number
  deadline: string | null
  status: string
  createdAt: string
  customer: {
    id: string
    name: string
    email: string
  }
  bids: {
    id: string
    amount: number
    proposal: string
    status: string
    createdAt: string
    freelancer: {
      id: string
      name: string
      rating: number
      totalProjects: number
    }
  }[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [proposal, setProposal] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projects/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProject(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.id])

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${params.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(bidAmount),
          proposal,
        }),
      })

      if (res.ok) {
        router.refresh()
        setBidAmount('')
        setProposal('')
        // Reload project data
        fetch(`/api/projects/${params.id}`)
          .then(res => res.json())
          .then(data => setProject(data))
      }
    } catch (err) {
      console.error('Error submitting bid:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!project) return
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'OPEN' }),
      })
      if (res.ok) {
        router.refresh()
        fetch(`/api/projects/${params.id}`)
          .then(res => res.json())
          .then(data => setProject(data))
      }
    } catch (err) {
      console.error('Error publishing project:', err)
    }
  }

  const handlePayment = async (bidId: string) => {
    if (!project) return
    setProcessingPayment(bidId)
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          bidId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        alert(data.error || 'Failed to create payment')
        setProcessingPayment(null)
      }
    } catch (err) {
      console.error('Error creating payment:', err)
      setProcessingPayment(null)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Project not found</div>
  }

  const isOwner = session?.user?.id === project.customer.id
  const isFreelancer = session?.user?.role === 'FREELANCER'
  const canBid = isFreelancer && project.status === 'OPEN' && !isOwner

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Projects
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <User className="h-5 w-5 mr-2" />
                <span>by {project.customer.name}</span>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm rounded ${
              project.status === 'OPEN' ? 'bg-green-100 text-green-800' :
              project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status}
            </span>
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{project.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
              <span className="font-semibold">Budget:</span>
              <span className="ml-2">{formatCurrency(project.budget)}</span>
            </div>
            {project.deadline && (
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                <span className="font-semibold">Deadline:</span>
                <span className="ml-2">{formatDate(project.deadline)}</span>
              </div>
            )}
          </div>

          {isOwner && project.status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Publish Project
            </button>
          )}
        </div>

        {/* Bids Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Bids ({project.bids.length})
          </h2>

          {canBid && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Submit a Bid</h3>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Amount (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Explain why you're the best fit for this project..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {project.bids.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bids yet. Be the first to bid!
            </div>
          ) : (
            <div className="space-y-4">
              {project.bids.map((bid) => (
                <div key={bid.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.freelancer.name}</p>
                      <p className="text-sm text-gray-600">
                        Rating: {bid.freelancer.rating.toFixed(1)} • {bid.freelancer.totalProjects} projects
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">{formatCurrency(bid.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-4">{bid.proposal}</p>
                  {isOwner && bid.status === 'PENDING' && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/bids/${bid.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'ACCEPTED' }),
                          })
                          if (res.ok) {
                            router.refresh()
                            fetch(`/api/projects/${params.id}`)
                              .then(res => res.json())
                              .then(data => setProject(data))
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/bids/${bid.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'REJECTED' }),
                          })
                          if (res.ok) {
                            router.refresh()
                            fetch(`/api/projects/${params.id}`)
                              .then(res => res.json())
                              .then(data => setProject(data))
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {isOwner && bid.status === 'ACCEPTED' && project.status === 'IN_PROGRESS' && (
                    <div className="mt-4">
                      <button
                        onClick={() => handlePayment(bid.id)}
                        disabled={processingPayment === bid.id}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 inline-flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {processingPayment === bid.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

