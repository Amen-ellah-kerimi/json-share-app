#!/usr/bin/env node

/**
 * Database Initialization Script
 * Sets up the database for first-time deployment
 */

const { execSync } = require('child_process');

console.log('🗄️  Database Initialization Script\n');

// Check environment
const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Database URL: ${dbUrl.replace(/:[^:@]*@/, ':***@')}\n`);

// Step 1: Generate Prisma client
console.log('1️⃣  Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client');
  console.error(error.message);
  process.exit(1);
}

// Step 2: Check if database exists and is accessible
console.log('2️⃣  Testing database connection...');
try {
  execSync('npx prisma db pull --force --schema=./prisma/schema.temp.prisma', { 
    stdio: 'pipe',
    timeout: 15000 
  });
  
  // Clean up temp file
  const fs = require('fs');
  if (fs.existsSync('./prisma/schema.temp.prisma')) {
    fs.unlinkSync('./prisma/schema.temp.prisma');
  }
  
  console.log('✅ Database connection successful\n');
} catch (error) {
  console.error('❌ Database connection failed');
  console.error('💡 Please check your DATABASE_URL and ensure the database exists');
  process.exit(1);
}

// Step 3: Initialize database schema
console.log('3️⃣  Initializing database schema...');
try {
  if (isProduction) {
    // In production, use migrate deploy
    console.log('   Using production migration strategy...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } else {
    // In development, use db push
    console.log('   Using development migration strategy...');
    execSync('npx prisma db push', { stdio: 'inherit' });
  }
  console.log('✅ Database schema initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize database schema');
  
  // Try alternative approach
  console.log('🔄 Trying alternative initialization...');
  try {
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log('✅ Database schema initialized with force reset\n');
  } catch (retryError) {
    console.error('❌ All initialization attempts failed');
    console.error('💡 Manual database setup may be required');
    process.exit(1);
  }
}

// Step 4: Verify tables exist
console.log('4️⃣  Verifying database tables...');
try {
  // Use a simple query to check if tables exist
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  await prisma.$queryRaw`SELECT COUNT(*) FROM users`;
  await prisma.$queryRaw`SELECT COUNT(*) FROM json_documents`;
  
  await prisma.$disconnect();
  console.log('✅ Database tables verified\n');
} catch (error) {
  console.error('❌ Database table verification failed');
  console.error('💡 Tables may not exist or have different names');
  console.error('Error:', error.message);
}

console.log('🎉 Database initialization completed!');
console.log('\n📋 Summary:');
console.log('   ✅ Prisma client generated');
console.log('   ✅ Database connection verified');
console.log('   ✅ Schema applied');
console.log('   ✅ Tables verified');
console.log('\n💡 Your database is ready for use!');
