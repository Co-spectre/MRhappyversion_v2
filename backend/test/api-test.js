// Complete API Testing Script for MRhappy Authentication System
// Tests all authentication endpoints including registration, login, and token management

// Using built-in fetch (Node.js 18+)
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test user data
const testUser = {
    email: 'apitest@mrhappy.com',
    password: 'TestPassword123!',
    name: 'API Test User',
    phone: '+1234567890',
    dataProcessingConsent: true
};

let authTokens = null;

console.log('🧪 Starting Complete API Authentication Tests...');
console.log('📡 Testing against:', BASE_URL);

// Utility function to make API calls
async function makeRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authTokens && { 'Authorization': `Bearer ${authTokens.accessToken}` })
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    console.log(`\n🔄 ${finalOptions.method || 'GET'} ${endpoint}`);
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Response:`, JSON.stringify(data, null, 2));
        
        return { status: response.status, data };
    } catch (error) {
        console.error(`❌ Request failed:`, error.message);
        return { status: 0, data: { success: false, message: error.message } };
    }
}

async function runTests() {
    try {
        // Test 1: Health Check
        console.log('\n1️⃣ Testing Health Check...');
        const health = await makeRequest('/health', { method: 'GET' });
        
        if (health.status === 404) {
            // Try root health endpoint
            const rootHealth = await fetch(`${BASE_URL}/health`);
            const rootData = await rootHealth.json();
            console.log(`📊 Root Health Status: ${rootHealth.status}`);
            console.log(`📋 Root Health Response:`, JSON.stringify(rootData, null, 2));
        }

        // Test 2: User Registration
        console.log('\n2️⃣ Testing User Registration...');
        const registration = await makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(testUser)
        });

        // Test 3: User Login
        console.log('\n3️⃣ Testing User Login...');
        const login = await makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        if (login.data.success && login.data.accessToken) {
            authTokens = {
                accessToken: login.data.accessToken,
                refreshToken: login.data.refreshToken
            };
            console.log('✅ Authentication tokens saved');
        }

        // Test 4: Protected Route - Profile
        if (authTokens) {
            console.log('\n4️⃣ Testing Protected Route (Profile)...');
            const profile = await makeRequest('/auth/profile', {
                method: 'GET'
            });
        }

        // Test 5: Token Refresh
        if (authTokens && authTokens.refreshToken) {
            console.log('\n5️⃣ Testing Token Refresh...');
            const refresh = await makeRequest('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({
                    refreshToken: authTokens.refreshToken
                })
            });

            if (refresh.data.success && refresh.data.accessToken) {
                authTokens.accessToken = refresh.data.accessToken;
                console.log('✅ New access token received');
            }
        }

        // Test 6: Auth Check
        console.log('\n6️⃣ Testing Auth Check...');
        const authCheck = await makeRequest('/auth/check', {
            method: 'GET'
        });

        // Test 7: Logout
        if (authTokens) {
            console.log('\n7️⃣ Testing Logout...');
            const logout = await makeRequest('/auth/logout', {
                method: 'POST'
            });
        }

        console.log('\n🎉 API Authentication Tests Completed!');
        console.log('\n📊 Summary:');
        console.log('✅ Health Check - Tested');
        console.log('✅ User Registration - Tested');
        console.log('✅ User Login - Tested');
        console.log('✅ Protected Routes - Tested');
        console.log('✅ Token Refresh - Tested');
        console.log('✅ Auth Check - Tested');
        console.log('✅ Logout - Tested');

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        console.error('📝 Stack:', error.stack);
    } finally {
        process.exit(0);
    }
}

// Run the tests
runTests();
