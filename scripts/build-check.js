#!/usr/bin/env node

/**
 * Build Check Script
 * Validates the build configuration and optimizes for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Build Check Script\n');

// Check Node.js version
function checkNodeVersion() {
  console.log('📋 Checking Node.js version...');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`   Current Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    console.log('❌ Node.js version 18 or higher is required');
    console.log('💡 Please upgrade Node.js');
    return false;
  }
  
  console.log('✅ Node.js version is compatible\n');
  return true;
}

// Check TypeScript configuration
function checkTypeScript() {
  console.log('📋 Checking TypeScript configuration...');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    console.log('❌ tsconfig.json not found');
    return false;
  }
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Check important TypeScript settings
    const compilerOptions = tsconfig.compilerOptions || {};
    
    if (compilerOptions.strict !== true) {
      console.log('⚠️  WARNING: TypeScript strict mode is not enabled');
    }
    
    if (compilerOptions.target !== 'ES2017' && compilerOptions.target !== 'ES2018') {
      console.log('⚠️  WARNING: Consider using ES2017 or ES2018 as target for better compatibility');
    }
    
    console.log('✅ TypeScript configuration looks good\n');
    return true;
  } catch (error) {
    console.log('❌ Invalid tsconfig.json');
    console.log('Error:', error.message);
    return false;
  }
}

// Check Next.js configuration
function checkNextConfig() {
  console.log('📋 Checking Next.js configuration...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  const nextConfigJsPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath) && !fs.existsSync(nextConfigJsPath)) {
    console.log('⚠️  No Next.js configuration file found');
    console.log('💡 Consider adding next.config.ts for better optimization');
    return true;
  }
  
  console.log('✅ Next.js configuration file found\n');
  return true;
}

// Check build dependencies
function checkBuildDependencies() {
  console.log('📋 Checking build dependencies...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    'typescript',
    '@types/node',
    '@types/react',
    '@types/react-dom'
  ];
  
  const missing = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required build dependencies:');
    missing.forEach(dep => console.log(`  - ${dep}`));
    return false;
  }
  
  console.log('✅ All build dependencies are present\n');
  return true;
}

// Test build process
function testBuild() {
  console.log('🏗️  Testing build process...');
  
  try {
    // Clean previous build
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      console.log('   Cleaning previous build...');
      fs.rmSync(buildDir, { recursive: true, force: true });
    }
    
    // Run build
    console.log('   Running build...');
    execSync('npm run build', { 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    
    // Check if build directory exists
    if (!fs.existsSync(buildDir)) {
      console.log('❌ Build directory not created');
      return false;
    }
    
    // Check for critical build files
    const criticalFiles = [
      '.next/BUILD_ID',
      '.next/package.json',
      '.next/server/app/page.js'
    ];
    
    const missingFiles = criticalFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (missingFiles.length > 0) {
      console.log('⚠️  Some build files are missing:');
      missingFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('✅ Build completed successfully\n');
    return true;
  } catch (error) {
    console.log('❌ Build failed');
    console.log('Error:', error.message);
    
    // Try to provide helpful error messages
    if (error.message.includes('ENOSPC')) {
      console.log('💡 This might be a disk space issue');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Build took too long - check for infinite loops or large dependencies');
    } else if (error.message.includes('TypeScript')) {
      console.log('💡 TypeScript compilation error - run "npm run lint" for details');
    }
    
    return false;
  }
}

// Analyze build output
function analyzeBuild() {
  console.log('📊 Analyzing build output...');
  
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ No build directory found');
    return false;
  }
  
  try {
    // Get build size
    const getBuildSize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          size += getBuildSize(filePath);
        } else {
          size += stats.size;
        }
      }
      
      return size;
    };
    
    const buildSize = getBuildSize(buildDir);
    const buildSizeMB = (buildSize / 1024 / 1024).toFixed(2);
    
    console.log(`   Build size: ${buildSizeMB} MB`);
    
    if (buildSize > 100 * 1024 * 1024) { // 100MB
      console.log('⚠️  WARNING: Build size is quite large');
      console.log('💡 Consider optimizing dependencies and assets');
    }
    
    console.log('✅ Build analysis completed\n');
    return true;
  } catch (error) {
    console.log('❌ Build analysis failed');
    console.log('Error:', error.message);
    return false;
  }
}

// Main function
async function runBuildCheck() {
  console.log('Starting build check...\n');
  
  let allPassed = true;
  
  allPassed &= checkNodeVersion();
  allPassed &= checkTypeScript();
  allPassed &= checkNextConfig();
  allPassed &= checkBuildDependencies();
  
  if (allPassed) {
    allPassed &= testBuild();
    if (allPassed) {
      allPassed &= analyzeBuild();
    }
  }
  
  if (allPassed) {
    console.log('🎉 All build checks passed!');
    console.log('💡 Your application is ready for production deployment');
  } else {
    console.log('❌ Some build checks failed');
    console.log('💡 Please fix the issues above before deploying');
    process.exit(1);
  }
}

// Run the build check
runBuildCheck().catch(error => {
  console.error('Build check failed:', error);
  process.exit(1);
});
