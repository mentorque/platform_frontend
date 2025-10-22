/**
 * Simple test script to verify the backend API is working
 * Run with: node test-api.js
 */

const crypto = require('crypto');

console.log('🧪 Testing Backend API Components\n');

// Test 1: Crypto module
console.log('Test 1: Crypto Module');
console.log('-------------------');
try {
  const randomBytes = crypto.randomBytes(32);
  const hexString = randomBytes.toString('hex');
  const apiKey = `mq_${hexString}`;
  console.log('✅ Crypto module is working');
  console.log(`   Sample API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`   Length: ${apiKey.length} characters\n`);
} catch (error) {
  console.error('❌ Crypto module error:', error.message);
}

// Test 2: Check if server module loads
console.log('Test 2: Server Module');
console.log('-------------------');
try {
  const app = require('./app');
  console.log('✅ App module loaded successfully');
  console.log(`   App type: ${typeof app}\n`);
} catch (error) {
  console.error('❌ Error loading app:', error.message);
}

// Test 3: Environment variables
console.log('Test 3: Environment Variables');
console.log('-------------------');
require('dotenv').config();
console.log(`   PORT: ${process.env.PORT || '3001 (default)'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log();

console.log('🎉 All basic tests completed!\n');
console.log('Next steps:');
console.log('1. Make sure PostgreSQL is running');
console.log('2. Update DATABASE_URL in .env file');
console.log('3. Run: npm run prisma:migrate');
console.log('4. Run: npm run prisma:generate');
console.log('5. Start the server: npm run dev');


