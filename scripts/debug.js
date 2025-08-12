#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 JSON Share App - Debug Script\n');

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('💡 Copy .env.example to .env and fill in your values\n');
    return false;
  }
  console.log('✅ .env file found\n');
  return true;
}

// Check required environment variables
function checkEnvVars() {
  console.log('📋 Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SIGNING_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  require('dotenv').config();
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(varName => console.log(`  - ${varName}`));
    console.log('');
    return false;
  }
  
  console.log('✅ All required environment variables are present\n');
  return true;
}

// Check database connection
async function checkDatabase() {
  console.log('🗄️  Checking database connection...');
  
  try {
    execSync('npx prisma db pull --schema=./prisma/schema.prisma', { 
      stdio: 'pipe',
      timeout: 10000 
    });
    console.log('✅ Database connection successful\n');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('💡 Check your DATABASE_URL and ensure the database is running\n');
    return false;
  }
}

// Check Prisma client
function checkPrismaClient() {
  console.log('🔧 Checking Prisma client...');
  
  try {
    execSync('npx prisma generate', { stdio: 'pipe' });
    console.log('✅ Prisma client generated successfully\n');
    return true;
  } catch (error) {
    console.log('❌ Prisma client generation failed');
    console.log('💡 Run: npm run db:generate\n');
    return false;
  }
}

// Check dependencies
function checkDependencies() {
  console.log('📦 Checking dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@clerk/nextjs',
    '@prisma/client',
    'next',
    'react',
    'zod'
  ];
  
  const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required dependencies:');
    missing.forEach(dep => console.log(`  - ${dep}`));
    console.log('💡 Run: npm install\n');
    return false;
  }
  
  console.log('✅ All required dependencies are installed\n');
  return true;
}

// Test API endpoints
async function testEndpoints() {
  console.log('🌐 Testing API endpoints...');
  
  try {
    // Start the dev server in background
    const { spawn } = require('child_process');
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: 'pipe',
      detached: true 
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test health endpoint
    const response = await fetch('http://localhost:3000/api/health');
    const health = await response.json();
    
    if (health.status === 'healthy') {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed:', health);
    }
    
    // Kill the server
    process.kill(-server.pid);
    
  } catch (error) {
    console.log('❌ API endpoint test failed:', error.message);
  }
  
  console.log('');
}

// Main debug function
async function runDebug() {
  let allPassed = true;
  
  allPassed &= checkEnvFile();
  allPassed &= checkEnvVars();
  allPassed &= checkDependencies();
  allPassed &= checkPrismaClient();
  allPassed &= await checkDatabase();
  
  if (allPassed) {
    console.log('🎉 All checks passed! Your app should be ready to run.');
    console.log('💡 Start the development server with: npm run dev\n');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above before running the app.\n');
  }
  
  // Show helpful commands
  console.log('📚 Helpful commands:');
  console.log('  npm run dev          - Start development server');
  console.log('  npm run db:studio    - Open Prisma Studio');
  console.log('  npm run db:push      - Push schema to database');
  console.log('  npm run build        - Build for production');
  console.log('  npm run lint         - Run ESLint');
}

// Run the debug script
runDebug().catch(console.error);
