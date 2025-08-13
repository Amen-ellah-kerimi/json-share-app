#!/usr/bin/env node

/**
 * Production Validation Script
 * Comprehensive validation of all production requirements
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Production Validation Script\n');

let allPassed = true;
const results = [];

function addResult(category, test, passed, message) {
  results.push({ category, test, passed, message });
  if (!passed) allPassed = false;
}

// 1. Environment Variables Validation
function validateEnvironment() {
  console.log('📋 Validating environment variables...');
  
  require('dotenv').config();
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SIGNING_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    addResult('Environment', 'Required Variables', false, `Missing: ${missing.join(', ')}`);
  } else {
    addResult('Environment', 'Required Variables', true, 'All required variables present');
  }
  
  // Validate URL formats
  try {
    new URL(process.env.NEXT_PUBLIC_APP_URL);
    addResult('Environment', 'App URL Format', true, 'Valid URL format');
  } catch {
    addResult('Environment', 'App URL Format', false, 'Invalid URL format');
  }
  
  // Check Clerk key formats
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (publishableKey && publishableKey.startsWith('pk_')) {
    addResult('Environment', 'Clerk Publishable Key', true, 'Valid format');
  } else {
    addResult('Environment', 'Clerk Publishable Key', false, 'Invalid format - should start with pk_');
  }
  
  if (secretKey && secretKey.startsWith('sk_')) {
    addResult('Environment', 'Clerk Secret Key', true, 'Valid format');
  } else {
    addResult('Environment', 'Clerk Secret Key', false, 'Invalid format - should start with sk_');
  }
}

// 2. File Structure Validation
function validateFileStructure() {
  console.log('📁 Validating file structure...');
  
  const requiredFiles = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/new/page.tsx',
    'src/app/sign-in/[[...sign-in]]/page.tsx',
    'src/app/sign-up/[[...sign-up]]/page.tsx',
    'src/middleware.ts',
    'prisma/schema.prisma',
    'next.config.ts',
    'vercel.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    addResult('Files', 'Required Files', false, `Missing: ${missingFiles.join(', ')}`);
  } else {
    addResult('Files', 'Required Files', true, 'All required files present');
  }
}

// 3. Dependencies Validation
function validateDependencies() {
  console.log('📦 Validating dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@clerk/nextjs',
    '@prisma/client',
    'next',
    'react',
    'react-dom',
    'zod',
    'prisma',
    'typescript'
  ];
  
  const missing = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missing.length > 0) {
    addResult('Dependencies', 'Required Packages', false, `Missing: ${missing.join(', ')}`);
  } else {
    addResult('Dependencies', 'Required Packages', true, 'All required packages installed');
  }
}

// 4. Build Validation
function validateBuild() {
  console.log('🏗️  Validating build...');
  
  try {
    // Clean previous build
    if (fs.existsSync('.next')) {
      fs.rmSync('.next', { recursive: true, force: true });
    }
    
    // Run build
    execSync('npm run build', { stdio: 'pipe', timeout: 300000 });
    
    if (fs.existsSync('.next')) {
      addResult('Build', 'Build Process', true, 'Build completed successfully');
    } else {
      addResult('Build', 'Build Process', false, 'Build directory not created');
    }
  } catch (error) {
    addResult('Build', 'Build Process', false, `Build failed: ${error.message}`);
  }
}

// 5. Database Validation
function validateDatabase() {
  console.log('🗄️  Validating database...');
  
  try {
    execSync('npx prisma generate', { stdio: 'pipe' });
    addResult('Database', 'Prisma Generate', true, 'Prisma client generated');
  } catch (error) {
    addResult('Database', 'Prisma Generate', false, `Failed: ${error.message}`);
  }
  
  try {
    execSync('npx prisma db pull --force --schema=./prisma/schema.prisma', { 
      stdio: 'pipe',
      timeout: 15000 
    });
    
    // Clean up temp file
    if (fs.existsSync('./prisma/schema.prisma')) {
      fs.unlinkSync('./prisma/schema.prisma');
    }
    
    addResult('Database', 'Connection', true, 'Database connection successful');
  } catch (error) {
    addResult('Database', 'Connection', false, `Connection failed: ${error.message}`);
  }
}

// 6. API Routes Validation
async function validateApiRoutes() {
  console.log('🌐 Validating API routes...');
  
  const apiRoutes = [
    'src/app/api/health/route.ts',
    'src/app/api/documents/route.ts',
    'src/app/api/webhooks/clerk/route.ts'
  ];
  
  const missingRoutes = apiRoutes.filter(route => !fs.existsSync(route));
  
  if (missingRoutes.length > 0) {
    addResult('API', 'Route Files', false, `Missing: ${missingRoutes.join(', ')}`);
  } else {
    addResult('API', 'Route Files', true, 'All API route files present');
  }
}

// Print Results
function printResults() {
  console.log('\n📊 Validation Results:\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  categories.forEach(category => {
    console.log(`${category}:`);
    const categoryResults = results.filter(r => r.category === category);
    
    categoryResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`  ${icon} ${result.test}: ${result.message}`);
    });
    console.log('');
  });
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`Summary: ${passed}/${total} checks passed\n`);
  
  if (allPassed) {
    console.log('🎉 All validation checks passed!');
    console.log('💡 Your application is ready for production deployment');
  } else {
    console.log('❌ Some validation checks failed');
    console.log('💡 Please fix the issues above before deploying to production');
    process.exit(1);
  }
}

// Main validation function
async function runValidation() {
  console.log('Starting comprehensive production validation...\n');
  
  validateEnvironment();
  validateFileStructure();
  validateDependencies();
  validateBuild();
  validateDatabase();
  await validateApiRoutes();
  
  printResults();
}

// Run validation
runValidation().catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});
