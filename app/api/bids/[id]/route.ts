import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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

    const data = await request.json()
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        project: true
      }
    })

    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      )
    }

    // Only project owner can accept/reject bids
    if (bid.project.customerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const updated = await prisma.bid.update({
      where: { id: params.id },
      data: {
        status: data.status
      }
    })

    // If bid is accepted, update project status
    if (data.status === 'ACCEPTED') {
      await prisma.project.update({
        where: { id: bid.projectId },
        data: {
          status: 'IN_PROGRESS'
        }
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating bid:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

