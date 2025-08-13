#!/usr/bin/env node

/**
 * API Testing Script for Production
 * Tests all API endpoints to ensure they're working correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');

console.log('🧪 API Testing Script');
console.log(`Testing API endpoints at: ${BASE_URL}\n`);

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const client = isHttps ? https : http;
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(10000); // 10 second timeout

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await makeRequest('/api/health');
    
    if (response.status === 200) {
      console.log('✅ Health endpoint: HEALTHY');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Environment: ${response.data.environment}`);
      console.log(`   Checks:`, response.data.checks);
    } else {
      console.log('❌ Health endpoint: UNHEALTHY');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.data);
    }
  } catch (error) {
    console.log('❌ Health endpoint: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

async function testDocumentsEndpoint() {
  console.log('🔍 Testing documents endpoint (unauthenticated)...');
  try {
    const response = await makeRequest('/api/documents');
    
    if (response.status === 401) {
      console.log('✅ Documents endpoint: Correctly returns 401 for unauthenticated requests');
    } else {
      console.log('❌ Documents endpoint: Unexpected response for unauthenticated request');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.data);
    }
  } catch (error) {
    console.log('❌ Documents endpoint: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

async function testWebhookEndpoint() {
  console.log('🔍 Testing webhook endpoint (without signature)...');
  try {
    const response = await makeRequest('/api/webhooks/clerk', {
      method: 'POST',
      body: { test: 'data' }
    });
    
    if (response.status === 400 || response.status === 401) {
      console.log('✅ Webhook endpoint: Correctly rejects unsigned requests');
    } else {
      console.log('❌ Webhook endpoint: Unexpected response for unsigned request');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.data);
    }
  } catch (error) {
    console.log('❌ Webhook endpoint: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

async function testNotFoundEndpoint() {
  console.log('🔍 Testing 404 handling...');
  try {
    const response = await makeRequest('/api/nonexistent');
    
    if (response.status === 404) {
      console.log('✅ 404 handling: Working correctly');
    } else {
      console.log('❌ 404 handling: Unexpected response');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ 404 handling: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

// Main test runner
async function runTests() {
  console.log('Starting API tests...\n');
  
  await testHealthEndpoint();
  await testDocumentsEndpoint();
  await testWebhookEndpoint();
  await testNotFoundEndpoint();
  
  console.log('🏁 API tests completed!');
}

// Run tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
