import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const url = process.env.DATABASE_URL || 'mysql://root:%23Jay%40345@localhost:3306/ticket_system'
    const adapter = new PrismaMariaDb(url)
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }
}
