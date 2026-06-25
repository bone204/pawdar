# Lessons Learned & Improvement Rules

## Prisma Schema Updates & Client Code Generation
- **Pattern/Issue:** After editing `schema.prisma` and running `npx prisma migrate dev`, TypeScript compilation errors can occur because the generated Prisma Client types are not updated automatically in some environments.
- **Rule:** Always run `npx prisma generate` immediately after running database migrations (`npx prisma migrate dev`) to ensure TypeScript types and exports in `@prisma/client` are fully up-to-date.

## NestJS JwtAuthGuard Dependencies
- **Pattern/Issue:** Using `@UseGuards(JwtAuthGuard)` in a controller inside a new NestJS module without importing `AuthModule` in that module's `imports` will cause a runtime dependency resolution error: `Nest can't resolve dependencies of the JwtAuthGuard (?). Please make sure that the argument JwtService at index [0] is available in the module`.
- **Rule:** Whenever a new NestJS module uses `JwtAuthGuard`, always make sure to import `AuthModule` (which exports `JwtModule`) in its imports configuration.
