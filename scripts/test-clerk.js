#!/usr/bin/env node

/**
 * Clerk Configuration Test Script
 * Validates Clerk setup for production deployment
 */

console.log('🔐 Clerk Configuration Test Script\n');

// Load environment variables
require('dotenv').config();

// Check required Clerk environment variables
function checkClerkEnvVars() {
  console.log('📋 Checking Clerk environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SIGNING_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required Clerk environment variables:');
    missing.forEach(varName => console.log(`  - ${varName}`));
    return false;
  }
  
  console.log('✅ All required Clerk environment variables are present');
  
  // Check key formats
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  
  // Validate key formats
  if (!publishableKey.startsWith('pk_')) {
    console.log('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with "pk_"');
    return false;
  }
  
  if (!secretKey.startsWith('sk_')) {
    console.log('❌ CLERK_SECRET_KEY should start with "sk_"');
    return false;
  }
  
  if (!webhookSecret.startsWith('whsec_')) {
    console.log('❌ CLERK_WEBHOOK_SIGNING_SECRET should start with "whsec_"');
    return false;
  }
  
  // Check if using production keys
  const isProduction = process.env.NODE_ENV === 'production';
  const hasLiveKeys = publishableKey.includes('_live_') && secretKey.includes('_live_');
  
  if (isProduction && !hasLiveKeys) {
    console.log('⚠️  WARNING: Using test keys in production environment');
    console.log('   Production should use live keys (pk_live_*, sk_live_*)');
  } else if (!isProduction && hasLiveKeys) {
    console.log('⚠️  WARNING: Using live keys in development environment');
    console.log('   Development should use test keys (pk_test_*, sk_test_*)');
  }
  
  console.log('✅ Clerk key formats are valid\n');
  return true;
}

// Check Clerk URLs configuration
function checkClerkUrls() {
  console.log('🔗 Checking Clerk URL configuration...');
  
  const urls = {
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL': process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL': process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL': process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL': process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard'
  };
  
  Object.entries(urls).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('✅ Clerk URLs configured\n');
  return true;
}

// Check if sign-in/sign-up pages exist
function checkAuthPages() {
  console.log('📄 Checking authentication pages...');
  
  const fs = require('fs');
  const path = require('path');
  
  const signInPath = path.join(process.cwd(), 'src/app/sign-in/[[...sign-in]]/page.tsx');
  const signUpPath = path.join(process.cwd(), 'src/app/sign-up/[[...sign-up]]/page.tsx');
  
  if (!fs.existsSync(signInPath)) {
    console.log('❌ Sign-in page not found at src/app/sign-in/[[...sign-in]]/page.tsx');
    return false;
  }
  
  if (!fs.existsSync(signUpPath)) {
    console.log('❌ Sign-up page not found at src/app/sign-up/[[...sign-up]]/page.tsx');
    return false;
  }
  
  console.log('✅ Authentication pages exist');
  console.log('  - Sign-in: src/app/sign-in/[[...sign-in]]/page.tsx');
  console.log('  - Sign-up: src/app/sign-up/[[...sign-up]]/page.tsx\n');
  return true;
}

// Check middleware configuration
function checkMiddleware() {
  console.log('🛡️  Checking middleware configuration...');
  
  const fs = require('fs');
  const path = require('path');
  
  const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    console.log('❌ Middleware file not found at src/middleware.ts');
    return false;
  }
  
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  if (!middlewareContent.includes('clerkMiddleware')) {
    console.log('❌ Middleware does not use clerkMiddleware');
    return false;
  }
  
  console.log('✅ Middleware configuration found\n');
  return true;
}

// Main test function
async function runClerkTests() {
  console.log('Starting Clerk configuration tests...\n');
  
  let allPassed = true;
  
  allPassed &= checkClerkEnvVars();
  allPassed &= checkClerkUrls();
  allPassed &= checkAuthPages();
  allPassed &= checkMiddleware();
  
  if (allPassed) {
    console.log('🎉 All Clerk configuration tests passed!');
    console.log('\n💡 Next steps for production:');
    console.log('   1. Set up Clerk webhook endpoint in Clerk dashboard');
    console.log('   2. Configure allowed redirect URLs');
    console.log('   3. Test authentication flow in production');
  } else {
    console.log('❌ Some Clerk configuration tests failed.');
    console.log('💡 Please fix the issues above before deploying to production.');
    process.exit(1);
  }
}

// Run tests
runClerkTests().catch(error => {
  console.error('Clerk test runner failed:', error);
  process.exit(1);
});
