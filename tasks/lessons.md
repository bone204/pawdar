# Lessons Learned & Improvement Rules

## Prisma Schema Updates & Client Code Generation
- **Pattern/Issue:** After editing `schema.prisma` and running `npx prisma migrate dev`, TypeScript compilation errors can occur because the generated Prisma Client types are not updated automatically in some environments.
- **Rule:** Always run `npx prisma generate` immediately after running database migrations (`npx prisma migrate dev`) to ensure TypeScript types and exports in `@prisma/client` are fully up-to-date.
