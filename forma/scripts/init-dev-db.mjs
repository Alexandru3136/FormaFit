import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import initSqlJs from "sql.js";

const dbPath = resolve("prisma", "dev.db");
const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "sex" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "weightKg" REAL NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "trainingDaysPerWeek" INTEGER NOT NULL,
    "availableTrainingDays" TEXT NOT NULL DEFAULT 'monday,wednesday,friday',
    "trainingPlace" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "foodPreferences" TEXT NOT NULL,
    "restrictions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Profile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCurrentPeriodEnd" DATETIME,
    "premiumAccessUntil" DATETIME,
    "lastVerifiedWebhookEvent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscription_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "MealLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinGrams" INTEGER NOT NULL,
    "carbGrams" INTEGER NOT NULL,
    "fatGrams" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "MealPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "ingredients" TEXT NOT NULL,
    "planJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlan_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "MealPlan_userId_status_idx" ON "MealPlan"("userId", "status");

  CREATE TABLE IF NOT EXISTS "WorkoutLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "exercisesJson" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutLog_userId_weekStart_dayLabel_key"
    ON "WorkoutLog"("userId", "weekStart", "dayLabel");
  CREATE INDEX IF NOT EXISTS "WorkoutLog_userId_completedAt_idx"
    ON "WorkoutLog"("userId", "completedAt");

  CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL UNIQUE,
    "keysJson" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "disabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "PushSubscription_userId_disabledAt_idx"
    ON "PushSubscription"("userId", "disabledAt");
`);

await mkdir(dirname(dbPath), { recursive: true });
await writeFile(dbPath, Buffer.from(db.export()));

console.log(`Initialized ${dbPath}`);
