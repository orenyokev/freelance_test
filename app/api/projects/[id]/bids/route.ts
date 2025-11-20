import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== 'FREELANCER') {
      return NextResponse.json(
        { error: "Only freelancers can submit bids" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { amount, proposal } = data

    if (!amount || !proposal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { error: "Project is not open for bids" },
        { status: 400 }
      )
    }

    const bid = await prisma.bid.create({
      data: {
        amount: parseFloat(amount),
        proposal,
        projectId: params.id,
        freelancerId: session.user.id,
      }
    })

    return NextResponse.json(bid)
  } catch (error) {
    console.error("Error creating bid:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

