import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const status = searchParams.get('status')

    const where: any = {}
    if (featured) {
      where.featured = true
      where.status = 'OPEN'
    }
    if (status) {
      where.status = status
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          }
        },
        bids: {
          select: {
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: featured ? 6 : undefined,
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
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

    const data = await request.json()
    const { title, description, budget, deadline } = data

    if (!title || !description || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        deadline: deadline ? new Date(deadline) : null,
        customerId: session.user.id,
        status: 'DRAFT',
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

