import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const role = session.user.role

    if (role === 'CUSTOMER') {
      const [projects, bids] = await Promise.all([
        prisma.project.count({
          where: { customerId: userId }
        }),
        prisma.bid.count({
          where: {
            project: {
              customerId: userId
            }
          }
        })
      ])

      return NextResponse.json({
        projects,
        bids,
        offerings: 0,
        earnings: 0,
      })
    } else if (role === 'FREELANCER') {
      const [offerings, payments] = await Promise.all([
        prisma.offering.count({
          where: { freelancerId: userId }
        }),
        prisma.payment.findMany({
          where: {
            freelancerId: userId,
            status: 'COMPLETED'
          }
        })
      ])

      const earnings = payments.reduce((sum, p) => sum + p.amount, 0)

      return NextResponse.json({
        projects: 0,
        bids: 0,
        offerings,
        earnings,
      })
    }

    return NextResponse.json({
      projects: 0,
      offerings: 0,
      earnings: 0,
      bids: 0,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

