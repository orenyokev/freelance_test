import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create 10 freelancers
  const freelancers = []
  const freelancerData = [
    { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', bio: 'Experienced full-stack developer specializing in React and Node.js. 5+ years of experience building scalable web applications.', skills: 'React, Node.js, TypeScript, MongoDB', category: 'Web Development' },
    { name: 'Michael Chen', email: 'michael.chen@example.com', bio: 'UI/UX designer with a passion for creating beautiful and intuitive user experiences. Expert in Figma and Adobe Creative Suite.', skills: 'UI/UX Design, Figma, Adobe XD, Prototyping', category: 'Design' },
    { name: 'Emily Rodriguez', email: 'emily.rodriguez@example.com', bio: 'Content writer and marketing specialist. I help businesses tell their story through compelling content and SEO optimization.', skills: 'Content Writing, SEO, Marketing, Copywriting', category: 'Writing' },
    { name: 'David Kim', email: 'david.kim@example.com', bio: 'Mobile app developer focused on iOS and Android. I build native and cross-platform apps with Flutter and React Native.', skills: 'iOS, Android, Flutter, React Native', category: 'Mobile Development' },
    { name: 'Jessica Martinez', email: 'jessica.martinez@example.com', bio: 'Data scientist and machine learning engineer. I turn data into actionable insights using Python, TensorFlow, and advanced analytics.', skills: 'Python, Machine Learning, Data Science, TensorFlow', category: 'Data Science' },
    { name: 'Robert Taylor', email: 'robert.taylor@example.com', bio: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines. AWS and Docker expert.', skills: 'AWS, Docker, Kubernetes, CI/CD', category: 'DevOps' },
    { name: 'Amanda White', email: 'amanda.white@example.com', bio: 'Graphic designer creating stunning visual identities for brands. Specialized in logo design and brand guidelines.', skills: 'Graphic Design, Logo Design, Branding, Illustrator', category: 'Design' },
    { name: 'James Wilson', email: 'james.wilson@example.com', bio: 'Backend developer with expertise in microservices architecture. Strong background in Java, Spring Boot, and PostgreSQL.', skills: 'Java, Spring Boot, PostgreSQL, Microservices', category: 'Backend Development' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@example.com', bio: 'Video editor and motion graphics artist. I create engaging video content for social media and marketing campaigns.', skills: 'Video Editing, After Effects, Premiere Pro, Motion Graphics', category: 'Video Production' },
    { name: 'Christopher Brown', email: 'christopher.brown@example.com', bio: 'Blockchain developer and smart contract specialist. Experienced with Solidity, Ethereum, and Web3 technologies.', skills: 'Blockchain, Solidity, Ethereum, Web3', category: 'Blockchain' },
  ]

  for (let i = 0; i < freelancerData.length; i++) {
    const data = freelancerData[i]
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const freelancer = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'FREELANCER',
        bio: data.bio,
        skills: data.skills,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        totalProjects: Math.floor(Math.random() * 20) + 5, // 5 to 25
      }
    })

    // Create an offering for each freelancer
    const basePrice = [500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 5000][i]
    await prisma.offering.create({
      data: {
        title: `${data.category} Services`,
        description: `Professional ${data.category.toLowerCase()} services. ${data.bio}`,
        price: basePrice,
        category: data.category,
        status: 'ACTIVE',
        featured: i < 3, // First 3 are featured
        freelancerId: freelancer.id,
      }
    })

    freelancers.push(freelancer)
    console.log(`Created freelancer: ${data.name}`)
  }

  // Create 10 projects
  const projectData = [
    { title: 'E-commerce Website Development', description: 'Need a modern e-commerce website with payment integration, product catalog, and admin dashboard. Must be responsive and SEO-friendly.', budget: 5000, status: 'OPEN' },
    { title: 'Mobile App for Fitness Tracking', description: 'Looking for a developer to build a fitness tracking mobile app with workout plans, progress tracking, and social features.', budget: 8000, status: 'OPEN' },
    { title: 'Brand Identity Design', description: 'Startup needs complete brand identity including logo, color palette, typography, and brand guidelines document.', budget: 2000, status: 'OPEN' },
    { title: 'Content Marketing Strategy', description: 'Need a content marketing expert to create a 6-month content strategy, blog posts, and social media content calendar.', budget: 3000, status: 'DRAFT' },
    { title: 'Data Analytics Dashboard', description: 'Build a real-time analytics dashboard to visualize business metrics. Need integration with multiple data sources.', budget: 6000, status: 'OPEN' },
    { title: 'Video Production for Product Launch', description: 'Create promotional video for product launch including script, filming, editing, and motion graphics.', budget: 4000, status: 'OPEN' },
    { title: 'Cloud Infrastructure Setup', description: 'Migrate existing infrastructure to AWS, set up CI/CD pipelines, and implement monitoring solutions.', budget: 7000, status: 'OPEN' },
    { title: 'Blockchain Smart Contract Development', description: 'Develop smart contracts for a DeFi application including token creation and staking mechanisms.', budget: 10000, status: 'OPEN' },
    { title: 'UI/UX Redesign for SaaS Platform', description: 'Complete UI/UX redesign of existing SaaS platform. Need user research, wireframes, and high-fidelity designs.', budget: 5500, status: 'IN_PROGRESS' },
    { title: 'Backend API Development', description: 'Build RESTful API with authentication, database integration, and documentation. Microservices architecture preferred.', budget: 4500, status: 'OPEN' },
  ]

  const customers = []
  const customerData = [
    { name: 'John Smith', email: 'john.smith@example.com' },
    { name: 'Maria Garcia', email: 'maria.garcia@example.com' },
    { name: 'Thomas Lee', email: 'thomas.lee@example.com' },
    { name: 'Jennifer Davis', email: 'jennifer.davis@example.com' },
    { name: 'William Moore', email: 'william.moore@example.com' },
  ]

  // Create customers
  for (const customerInfo of customerData) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const customer = await prisma.user.create({
      data: {
        email: customerInfo.email,
        password: hashedPassword,
        name: customerInfo.name,
        role: 'CUSTOMER',
      }
    })
    customers.push(customer)
    console.log(`Created customer: ${customerInfo.name}`)
  }

  // Create projects
  for (let i = 0; i < projectData.length; i++) {
    const data = projectData[i]
    const customer = customers[i % customers.length] // Distribute projects among customers
    
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        budget: data.budget,
        status: data.status,
        featured: i < 3, // First 3 are featured
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        customerId: customer.id,
      }
    })

    // Create some bids for open projects
    if (data.status === 'OPEN') {
      const numBids = Math.floor(Math.random() * 4) + 1 // 1 to 4 bids
      const shuffledFreelancers = [...freelancers].sort(() => Math.random() - 0.5)
      
      for (let j = 0; j < Math.min(numBids, shuffledFreelancers.length); j++) {
        const freelancer = shuffledFreelancers[j]
        const bidAmount = data.budget * (0.7 + Math.random() * 0.3) // 70% to 100% of budget
        
        await prisma.bid.create({
          data: {
            amount: Math.round(bidAmount),
            proposal: `I have extensive experience in this area and can deliver high-quality results. My approach includes ${['agile methodology', 'thorough testing', 'regular communication', 'best practices'][j % 4]}. I'm excited to work on this project!`,
            status: j === 0 && i === 8 ? 'ACCEPTED' : 'PENDING', // Accept one bid for the IN_PROGRESS project
            projectId: project.id,
            freelancerId: freelancer.id,
          }
        })
      }
    }

    console.log(`Created project: ${data.title}`)
  }

  // Create an admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    }
  })
  console.log('Created admin user: admin@example.com')

  console.log('\n✅ Seed completed successfully!')
  console.log('\nDemo credentials:')
  console.log('Freelancers/Customers: Use any email from above with password: password123')
  console.log('Admin: admin@example.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

