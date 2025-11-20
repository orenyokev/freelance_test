import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [totalUsers, totalProjects, activeProjects, payments] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({
        where: {
          status: 'IN_PROGRESS'
        }
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED'
        }
      })
    ])

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      totalUsers,
      totalProjects,
      activeProjects,
      totalRevenue,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

