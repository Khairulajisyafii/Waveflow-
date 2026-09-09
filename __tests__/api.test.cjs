const test = require('node:test');
const assert = require('node:assert');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.CI_WEBHOOK_SECRET;

test('Waveflow API Integration Tests', async (t) => {
  let cookie;
  let projectId;
  let taskId;
  const uniqueEmail = `test_${Date.now()}@test.com`;

  await t.test('POST /api/register', async () => {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'password', name: 'Test User' })
    });
    assert.strictEqual(res.status, 201);
  });

  await t.test('POST /api/login', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'password' })
    });
    assert.strictEqual(res.status, 200);
    const setCookieHeader = res.headers.get('set-cookie');
    assert.ok(setCookieHeader);
    const match = setCookieHeader.match(/(session=[^;]+)/);
    cookie = match ? match[1] : setCookieHeader;
  });

  await t.test('GET /api/me', async () => {
    const res = await fetch(`${BASE_URL}/api/me`, {
      headers: { 'Cookie': cookie }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, uniqueEmail);
  });

  await t.test('POST /api/projects', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ name: 'Integration Test Project' })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.id);
    projectId = data.id;
  });

  await t.test('GET /api/projects', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      headers: { 'Cookie': cookie }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.some(p => p.id === projectId));
  });

  await t.test('POST /api/tasks', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ title: 'Integration Task', projectId })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.id);
    taskId = data.id;
  });

  await t.test('GET /api/tasks', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks?projectId=${projectId}`, {
      headers: { 'Cookie': cookie }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.some(t => t.id === taskId));
  });

  await t.test('PUT /api/tasks/[id]', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ status: 'DONE' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'DONE');
  });
  
  await t.test('DELETE /api/tasks/[id]', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Cookie': cookie }
    });
    assert.strictEqual(res.status, 200);
  });

  await t.test('PUT /api/projects/[id] - Link GitHub Repo', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ githubRepo: 'test/repo' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.githubRepo, 'test/repo');
  });

  await t.test('POST /api/ci/webhook - Unauthorized (no secret)', async () => {
    const res = await fetch(`${BASE_URL}/api/ci/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, status: 'SUCCESS' })
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('POST /api/ci/webhook - Unauthorized (invalid secret)', async () => {
    const res = await fetch(`${BASE_URL}/api/ci/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer wrong_secret' },
      body: JSON.stringify({ projectId, status: 'SUCCESS' })
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('POST /api/ci/webhook - Valid Update by Project ID', async () => {
    const res = await fetch(`${BASE_URL}/api/ci/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WEBHOOK_SECRET}` },
      body: JSON.stringify({ projectId, status: 'RUNNING' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.project.ciStatus, 'RUNNING');
  });

  await t.test('POST /api/ci/webhook - Valid Update by Repo URL', async () => {
    const res = await fetch(`${BASE_URL}/api/ci/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WEBHOOK_SECRET}` },
      body: JSON.stringify({ repoUrl: 'test/repo', status: 'SUCCESS' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.project.ciStatus, 'SUCCESS');
  });
});
