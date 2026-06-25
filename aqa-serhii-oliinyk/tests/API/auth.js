export async function getToken(request) {
  const response = await request.post('/api/auth/login', {
    data: {
      username: 'admin',
      password: 'password'
    }
  });

  if (!response.ok()) {
    throw new Error(`Auth failed with status ${response.status()}`);
  }

 const headers = response.headers();
const setCookie = headers['set-cookie'];

if (setCookie) {
  return setCookie.split(';')[0];
}

const body = await response.json();

if (body.token) {
  return body.token;
}

throw new Error('No auth token found in response');

  
}