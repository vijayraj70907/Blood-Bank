const http = require('http');

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost', port: 5000,
      path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); } catch { resolve({ status: res.statusCode, body: raw }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== Testing All Demo Logins ===\n');

  const demos = [
    { email: 'admin@bloodbridge.in', password: 'admin123', label: 'Blood Bank Owner' },
    { email: 'donor@bloodbridge.in', password: 'donor123', label: 'Donor' },
    { email: 'patient@bloodbridge.in', password: 'patient123', label: 'Patient' },
    { email: 'super@bloodbridge.in', password: 'super123', label: 'Super Admin' },
  ];

  for (const demo of demos) {
    const result = await makeRequest('/api/auth/login', 'POST', { email: demo.email, password: demo.password });
    if (result.status === 200) {
      console.log(`✅ ${demo.label} (${demo.email}) — Login SUCCESS | role: ${result.body.user?.role}`);
    } else {
      console.log(`❌ ${demo.label} (${demo.email}) — FAILED | Status: ${result.status} | Error: ${result.body.error || JSON.stringify(result.body)}`);
    }
  }

  console.log('\n=== Testing Registration ===\n');
  const timestamp = Date.now();
  const regResult = await makeRequest('/api/auth/register', 'POST', {
    name: 'Test User',
    email: `testuser${timestamp}@test.com`,
    phone: `+919${timestamp.toString().slice(-9)}`,
    password: 'test1234',
    role: 'patient',
    bloodGroup: 'O+',
    city: 'Hyderabad',
    state: 'Telangana',
  });

  if (regResult.status === 201) {
    console.log(`✅ Registration SUCCESS | User: ${regResult.body.user?.name} | Role: ${regResult.body.user?.role}`);
    console.log(`   Token received: ${regResult.body.token ? 'YES' : 'NO'}`);
  } else {
    console.log(`❌ Registration FAILED | Status: ${regResult.status}`);
    console.log(`   Error:`, regResult.body);
  }

  console.log('\n=== Testing Wrong Password (should give clear error) ===\n');
  const wrongPass = await makeRequest('/api/auth/login', 'POST', { email: 'donor@bloodbridge.in', password: 'wrongpassword' });
  console.log(`Wrong password response (${wrongPass.status}): ${wrongPass.body.error}`);

  console.log('\n=== Testing Non-existent Email ===\n');
  const noUser = await makeRequest('/api/auth/login', 'POST', { email: 'nobody@nowhere.com', password: 'test123' });
  console.log(`Non-existent email response (${noUser.status}): ${noUser.body.error}`);
}

main().catch(console.error);
