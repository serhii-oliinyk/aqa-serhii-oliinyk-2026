import { test, expect } from '@playwright/test';
import { getToken } from './auth';
import { sharedData } from './sharedData';

test('ADMIN: create → see booking → update → delete room', async ({ request }) => {

  const token = await getToken(request);

  const roomName = `207-${Date.now().toString().slice(-2)}`;
  const email = `test${Date.now().toString().slice(-2)}@gmail.com`;

  let roomId;

  sharedData.roomName = roomName;
  sharedData.email = email;

  // CREATE ROOM
  const createRes = await request.post('/api/room', {
    headers: {
      'Cookie': `token=${token}`
    },
    data: {
      roomName,
      type: 'Single',
      accessible: false,
      description: 'Admin created room',
      image: 'https://www.mwtestconsultancy.co.uk/img/room1.jpg',
      roomPrice: '400',
      features: ['Refreshments', 'Safe', 'Views']
    }
  });

  expect(createRes.status()).toBe(200);

  const rooms = await request.get('/api/room');
  const body = await rooms.json();

  const createdRoom = body.rooms.find(r => r.roomName === roomName);

  expect(createdRoom).toBeTruthy();

  roomId = String(createdRoom.roomid);
  sharedData.roomId = roomId;

  console.log('ADMIN - Room created:', createdRoom);

  // UPDATE ROOM
  const updateRes = await request.put(`/api/room/${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    },
    data: {
      roomName,
      type: 'Double',
      accessible: true,
      description: 'Updated by admin',
      image: 'https://www.mwtestconsultancy.co.uk/img/room2.jpg',
      roomPrice: 999,
      features: ['WiFi', 'TV']
    }
  });

  expect(updateRes.status()).toBe(200);

  console.log('ADMIN - Room updated');

  // DELETE ROOM
  const deleteRes = await request.delete(`/api/room/${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    }
  });

  expect(deleteRes.status()).toBe(200);

  console.log('ADMIN - Room deleted');
});
