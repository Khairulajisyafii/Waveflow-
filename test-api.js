const http = require('http');

async function run() {
  try {
    const resReg = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test2@test.com', password: 'password', name: 'Test User' })
    });
    console.log('Register status:', resReg.status);
    
    const resLog = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test2@test.com', password: 'password' })
    });
    console.log('Login status:', resLog.status);
    const cookie = resLog.headers.get('set-cookie');
    
    const resMe = await fetch('http://localhost:3000/api/me', {
      headers: { 'Cookie': cookie }
    });
    console.log('Me status:', resMe.status);
    console.log(await resMe.json());
    
    const resProjPost = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ name: 'My First Project' })
    });
    console.log('Project POST status:', resProjPost.status);
    console.log(await resProjPost.json());
    
    const resProjGet = await fetch('http://localhost:3000/api/projects', {
      headers: { 'Cookie': cookie }
    });
    console.log('Project GET status:', resProjGet.status);
    console.log(await resProjGet.json());
  } catch (e) {
    console.error(e);
  }
}

run();
