import { test, expect } from '@playwright/test';
import { sharedData } from './sharedData';

test('USER: see room → book → see update → see deletion', async ({ request }) => {

  const roomName = sharedData.roomName;
  const email = sharedData.email;
  const roomId = sharedData.roomId;

  let bookingId;

  // SEE ROOM
  const roomsRes = await request.get('/api/room');
  const roomsBody = await roomsRes.json();

  const room = roomsBody.rooms.find(r => r.roomName === roomName);

  expect(room).toBeTruthy();

  console.log('USER - Room visible');

  // BOOK ROOM
  const bookingRes = await request.post('/api/booking', {
    data: {
      roomid: roomId,
      firstname: 'QAA',
      lastname: 'Tester',
      depositpaid: false,
      bookingdates: {
        checkin: '2026-04-20',
        checkout: '2026-04-22'
      },
      email,
      phone: '+380931234567'
    }
  });

  expect(bookingRes.status()).toBe(201);

  const bookingBody = await bookingRes.json();
  bookingId = bookingBody.bookingid;

  console.log('USER - Booking created:', bookingBody);

  // SEE UPDATED ROOM
  const updatedRes = await request.get('/api/room');
  const updatedBody = await updatedRes.json();

  const updatedRoom = updatedBody.rooms.find(
    r => String(r.roomid) === String(roomId)
  );

  expect(updatedRoom).toBeTruthy();

  console.log('USER - Updated room visible');

  // VERIFY DELETED
  const finalRes = await request.get('/api/room');
  const finalBody = await finalRes.json();

  const deleted = finalBody.rooms.find(
    r => String(r.roomid) === String(roomId)
  );

  expect(deleted).toBeUndefined();

  console.log('USER - Room deleted');
});
