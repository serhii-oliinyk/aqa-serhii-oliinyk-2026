import { test, expect } from '@playwright/test';
import { getToken } from './auth';

test('Create room', async ({ request }) => {

  const token = await getToken(request);

  const roomName = '207';

  const createRoom = await request.post('/api/room', {
    headers: {
      'Cookie': `token=${token}`
    },
    data: {
      roomName: roomName,
      type: 'Single',
      accessible: false,
      description: 'Please enter a description for this room',
      image: 'https://www.mwtestconsultancy.co.uk/img/room1.jpg',
      roomPrice: '400',
      features: ['Refreshments', 'Safe', 'Views']
    }
  });

  expect(createRoom.status()).toBe(200);

  const getRooms = await request.get('/api/room');
  expect(getRooms.status()).toBe(200);

  const body = await getRooms.json();

  const roomExists = body.rooms.some(room => room.roomName === roomName);

  expect(roomExists).toBeTruthy();

  body.rooms.forEach(room => {
  console.log(`Room: ${room.roomName}, Type: ${room.type}, Price: ${room.roomPrice}`);
});
});