// Prisma client stub - will be properly initialized once Prisma binary issues are resolved
// For now, exports a mock to allow builds to proceed

let prisma: any = null

if (process.env.NODE_ENV === 'development') {
  if (!(global as any).prisma) {
    (global as any).prisma = null
  }
  prisma = (global as any).prisma
} else {
  prisma = null
}

export { prisma }
export default prisma
