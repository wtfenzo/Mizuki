generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  userId    String        @id
  noPrefix  NoPrefixUser?
  blacklist Blacklist?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model Blacklist {
  userId       String   @id
  user         User     @relation(fields: [userId], references: [userId], onDelete: Cascade)
  reason       String
  executorId   String?
  executorName String?
  createdAt    DateTime @default(now())
}

model NoPrefixUser {
  userId       String   @id
  executorId   String
  executorName String
  timestamp    Int
  endTimestamp Int
  enabled      Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([enabled])
  @@index([userId, enabled])
}
