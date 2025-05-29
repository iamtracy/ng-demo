import { Message, PrismaClient, User } from '@prisma/client'
import { config } from 'dotenv'

config()

import messages from '../../cypress/fixtures/messages.json'
import users from '../../cypress/fixtures/users.json'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

interface JsonUser {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  roles: string[]
  displayName: string
}

interface JsonMessage {
  text: string
  category: string
}

interface MessagesData {
  admin: JsonMessage[]
  user1: JsonMessage[]
  user2: JsonMessage[]
}

async function main(): Promise<void> {
  console.log('🌌 Seeding users from JSON...')

  const userPromises = Object.values(users).map(async (userData: JsonUser) => {
    return await createUser(userData)
  })
  const createdUsers = await Promise.all(userPromises)

  console.log('🌌 Seeding messages from JSON...')
  await createMessagesForUsers(messages as MessagesData, createdUsers)

  console.log(
    `✅ Created ${String(Object.keys(users).length)} users and messages`,
  )
}

async function createUser(userData: JsonUser): Promise<User> {
  return await prisma.user.upsert({
    where: { id: userData.id },
    update: {},
    create: {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roles: userData.roles,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    },
  })
}

async function createMessagesForUsers(
  messagesData: MessagesData,
  createdUsers: User[],
): Promise<void> {
  const userMapping = {
    admin: createdUsers.find((user) => user.id === 'zaphod-beeblebrox-id')?.id,
    user1: createdUsers.find((user) => user.id === 'arthur-dent-id')?.id,
    user2: createdUsers.find((user) => user.id === 'trillian-astra-id')?.id,
  }

  const allMessagePromises: Promise<Message>[] = []

  for (const [userKey, userMessages] of Object.entries(messagesData)) {
    const userId = userMapping[userKey as keyof typeof userMapping]
    if (userId === undefined) {
      console.warn(`⚠️ No user found for key: ${userKey}`)
      continue
    }

    const messagePromises: Promise<Message>[] = (
      userMessages as JsonMessage[]
    ).map(async (messageData: JsonMessage) => {
      return await prisma.message.create({
        data: {
          message: messageData.text,
          userId: userId,
        },
      })
    })

    allMessagePromises.push(...messagePromises)
  }

  await Promise.all(allMessagePromises)
  console.log(`✅ Created ${String(allMessagePromises.length)} messages`)
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
