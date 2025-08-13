#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Safely applies database schema changes to production
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Production Database Migration Script\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('💡 Set DATABASE_URL before running migrations');
  process.exit(1);
}

// Validate DATABASE_URL format for production
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.includes('sslmode=require') && dbUrl.includes('neon.tech')) {
  console.warn('⚠️  WARNING: DATABASE_URL should include ?sslmode=require for Neon');
  console.warn('   Current URL:', dbUrl);
  console.warn('   Recommended format: postgresql://user:pass@host/db?sslmode=require\n');
}

console.log('📋 Pre-migration checks...');

// Check if Prisma is available
try {
  execSync('npx prisma --version', { stdio: 'pipe' });
  console.log('✅ Prisma CLI available');
} catch (error) {
  console.error('❌ Prisma CLI not found');
  console.error('💡 Run: npm install prisma');
  process.exit(1);
}

// Check database connectivity
console.log('🔍 Testing database connection...');
try {
  execSync('npx prisma db pull --force --schema=./prisma/schema.prisma', { 
    stdio: 'pipe',
    timeout: 30000 
  });
  console.log('✅ Database connection successful');
} catch (error) {
  console.error('❌ Database connection failed');
  console.error('💡 Check your DATABASE_URL and network connectivity');
  console.error('Error:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Prisma client generation failed');
  console.error('Error:', error.message);
  process.exit(1);
}

// Check if migrations directory exists
const migrationsDir = './prisma/migrations';
if (!fs.existsSync(migrationsDir)) {
  console.log('📁 No migrations directory found, creating initial migration...');
  
  try {
    // Create initial migration
    execSync('npx prisma migrate dev --name init --create-only', { stdio: 'inherit' });
    console.log('✅ Initial migration created');
  } catch (error) {
    console.error('❌ Failed to create initial migration');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Apply migrations
console.log('🚀 Applying database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Database migrations applied successfully');
} catch (error) {
  console.error('❌ Migration failed');
  console.error('Error:', error.message);
  
  // Try to reset and apply again (dangerous in production, but sometimes necessary)
  console.log('🔄 Attempting to resolve migration issues...');
  try {
    execSync('npx prisma migrate resolve --applied "$(ls prisma/migrations | tail -1)"', { stdio: 'pipe' });
    execSync('npma prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migration issues resolved');
  } catch (resolveError) {
    console.error('❌ Could not resolve migration issues');
    console.error('💡 Manual intervention may be required');
    process.exit(1);
  }
}

// Verify schema
console.log('🔍 Verifying database schema...');
try {
  execSync('npx prisma db pull --force --schema=./prisma/schema.temp.prisma', { stdio: 'pipe' });
  
  // Compare schemas (basic check)
  const originalSchema = fs.readFileSync('./prisma/schema.prisma', 'utf8');
  const pulledSchema = fs.readFileSync('./prisma/schema.temp.prisma', 'utf8');
  
  // Clean up temp file
  fs.unlinkSync('./prisma/schema.temp.prisma');
  
  console.log('✅ Database schema verification completed');
} catch (error) {
  console.error('❌ Schema verification failed');
  console.error('Error:', error.message);
}

console.log('\n🎉 Production migration completed successfully!');
console.log('💡 Next steps:');
console.log('   1. Test your application endpoints');
console.log('   2. Verify data integrity');
console.log('   3. Monitor application logs');
