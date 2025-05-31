import { Message, PrismaClient, User } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

type SeedUser = Partial<User>
type SeedMessagesData = Record<string, Pick<Message, 'message'>[]>

// Inline seed data
const users = {
  admin: {
    id: 'zaphod-beeblebrox-id',
    email: 'zaphod@galaxy.gov',
    username: 'zaphod',
    firstName: 'Zaphod',
    lastName: 'Beeblebrox',
    roles: ['admin', 'user'],
  },
  user1: {
    id: 'arthur-dent-id',
    email: 'arthur@earth.sol',
    username: 'arthur',
    firstName: 'Arthur',
    lastName: 'Dent',
    roles: ['user'],
  },
  user2: {
    id: 'trillian-astra-id',
    email: 'trillian@galaxy.gov',
    username: 'trillian',
    firstName: 'Trillian',
    lastName: 'Astra',
    roles: ['user'],
  },
}

const messages: SeedMessagesData = {
  admin: [
    { message: 'Welcome to the NG Demo! Administrative functions are ready.' },
    { message: 'System status: All services operational.' },
    { message: 'Database seeding completed successfully.' },
  ],
  user1: [
    { message: 'Hello! This is my first message in the system.' },
    { message: 'Testing the message functionality - looks good!' },
    { message: 'Great to be part of this demo application.' },
  ],
  user2: [
    { message: 'Another user checking in! The interface is very clean.' },
    { message: 'Excited to explore all the features available.' },
    { message: 'This messaging system works really well!' },
  ],
}

async function main(): Promise<void> {
  console.log('🌌 Seeding users from JSON...')

  const userPromises = Object.values(users).map(async (userData: SeedUser) => {
    return await createUser(userData)
  })
  const createdUsers = await Promise.all(userPromises)

  console.log('🌌 Seeding messages from JSON...')
  await createMessagesForUsers(messages, createdUsers)

  console.log('✨ Seeding complete!')
}

async function createUser(userData: SeedUser): Promise<User> {
  const user = await prisma.user.upsert({
    where: { id: userData.id },
    update: {
      updatedAt: new Date(),
    },
    create: {
      id: userData.id ?? '',
      email: userData.email ?? '',
      username: userData.username ?? '',
      firstName: userData.firstName ?? '',
      lastName: userData.lastName ?? '',
      roles: userData.roles,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    },
  })

  console.log(`👤 User ${userData.username ?? 'unknown'} ready`)
  return user
}

async function createMessagesForUsers(
  messagesData: SeedMessagesData,
  createdUsers: User[],
): Promise<void> {
  console.log('🌌 Seeding messages for users...')

  const userMapping = {
    admin: createdUsers.find((user) => user.id === 'zaphod-beeblebrox-id')?.id,
    user1: createdUsers.find((user) => user.id === 'arthur-dent-id')?.id,
    user2: createdUsers.find((user) => user.id === 'trillian-astra-id')?.id,
  }

  const allMessagePromises: Promise<Message | null>[] = []

  for (const [userKey, userMessages] of Object.entries(messagesData)) {
    const userId = userMapping[userKey as keyof typeof userMapping]
    if (userId === undefined) {
      console.warn(`⚠️ No user found for key: ${userKey}`)
      continue
    }

    const existingMessageCount = await prisma.message.count({
      where: { userId: userId },
    })

    if (existingMessageCount > 0) {
      console.log(
        `⏭️ User ${userKey} already has ${String(existingMessageCount)} messages, skipping...`,
      )
      continue
    }

    const messagePromises: Promise<Message>[] = userMessages.map(
      async ({ message }) => {
        return await prisma.message.create({
          data: {
            message,
            userId,
          },
        })
      },
    )

    allMessagePromises.push(...messagePromises)
  }

  if (allMessagePromises.length > 0) {
    await Promise.all(allMessagePromises)
    console.log(`✅ Created ${String(allMessagePromises.length)} new messages`)
  } else {
    console.log('ℹ️ All users already have messages, no new messages created')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e: unknown) => {
    console.error('💥 Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
