import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const freelancerId = searchParams.get('freelancerId')

    const where: any = {
      status: 'ACTIVE'
    }
    if (featured) {
      where.featured = true
    }
    if (freelancerId) {
      where.freelancerId = freelancerId
    }

    const offerings = await prisma.offering.findMany({
      where,
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalProjects: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(offerings)
  } catch (error) {
    console.error("Error fetching offerings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
        { error: "Only freelancers can create offerings" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { title, description, price, category } = data

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const offering = await prisma.offering.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        freelancerId: session.user.id,
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalProjects: true,
          }
        }
      }
    })

    return NextResponse.json(offering)
  } catch (error) {
    console.error("Error creating offering:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

