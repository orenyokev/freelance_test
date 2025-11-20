import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'

    const where: any = {
      role: 'FREELANCER',
    }

    const freelancers = await prisma.user.findMany({
      where,
      include: {
        offerings: {
          where: featured ? { featured: true, status: 'ACTIVE' } : { status: 'ACTIVE' },
          take: 1,
          orderBy: {
            price: 'asc'
          }
        }
      },
      orderBy: featured ? {
        rating: 'desc'
      } : {
        createdAt: 'desc'
      },
      take: featured ? 6 : undefined,
    })

    // Filter to only show freelancers with featured offerings if featured=true
    const filteredFreelancers = featured
      ? freelancers.filter(f => f.offerings.length > 0)
      : freelancers

    return NextResponse.json(filteredFreelancers)
  } catch (error) {
    console.error("Error fetching freelancers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

