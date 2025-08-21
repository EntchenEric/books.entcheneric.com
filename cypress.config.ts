import { defineConfig } from "cypress";
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async 'db:seed'() {
          await prisma.book.deleteMany();
          await prisma.user.deleteMany();
          await prisma.purchaseOptionCache.deleteMany();

          await prisma.user.create({
            data: {
              url: "testUser",
              passwordHash: await bcrypt.hash("TestPasswort", 10)
            },
          });
          return null;
        },

        async 'db:teardown'() {
          await prisma.book.deleteMany();
          await prisma.user.deleteMany();
          await prisma.purchaseOptionCache.deleteMany();
          return null;
        },
      });
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});