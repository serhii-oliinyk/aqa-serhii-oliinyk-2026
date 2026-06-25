import { test, expect } from '@playwright/test';
import { getToken } from './auth';

test('Room lifecycle with intercept: create → book → edit → delete', async ({ request }) => {

  const token = await getToken(request);

  const roomName = `207-${Date.now().toString().slice(-2)}`;
  const email = `test${Date.now().toString().slice(-2)}@gmail.com`;

  let roomId;
  let bookingId;


  // CREATE ROOM

  const createRoom = await request.post('/api/room', {
    headers: {
      'Cookie': `token=${token}`
    },
    data: {
      roomName,
      type: 'Single',
      accessible: false,
      description: 'Please enter a description for this room',
      image: 'https://www.mwtestconsultancy.co.uk/img/room1.jpg',
      roomPrice: '400',
      features: ['Refreshments', 'Safe', 'Views']
    }
  });

  expect(createRoom.status()).toBe(200);
  console.log('Room is created:', await createRoom.json());


  // GET ALL ROOMS

  const roomsRes = await request.get('/api/room');
  const roomsBody = await roomsRes.json();

  console.log('List of rooms:', roomsBody);

  const createdRoom = roomsBody.rooms.find(
    room => room.roomName === roomName
  );

  expect(createdRoom).toBeTruthy();

  roomId = String(createdRoom.roomid);
  console.log('ROOM ID:', roomId);


  // BOOK ROOM

  const bookingResponse = await request.post('/api/booking', {
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

  expect(bookingResponse.status()).toBe(201);

  const bookingBody = await bookingResponse.json();
  bookingId = bookingBody.bookingid;

  console.log('The room is successfully booked:', bookingBody);

  expect(bookingId).toBeTruthy();


  // VERIFY BOOKING

  const adminBookings = await request.get(`/api/booking?roomid=${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    }
  });

  const adminBody = await adminBookings.json();

  console.log('Booking for room:', adminBody);

  const bookings = Array.isArray(adminBody)
    ? adminBody
    : adminBody.bookings ?? [];

  const exists = Array.isArray(bookings)
    ? bookings.some(b => b.bookingid === bookingId)
    : bookings?.bookingid === bookingId;

  expect(exists).toBeTruthy();


  // EDIT ROOM

  const editRoom = await request.put(`/api/room/${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    },
    data: {
      roomName,
      type: 'Double',
      accessible: true,
      description: 'Updated room description',
      image: 'https://www.mwtestconsultancy.co.uk/img/room2.jpg',
      roomPrice: 999,
      features: ['WiFi', 'TV']
    }
  });

  expect(editRoom.status()).toBe(200);
  console.log('The room is successfully updated:', await editRoom.json());


// VERIFY UPDATE

    const verifyRooms = await request.get('/api/room');
    const verifyBody = await verifyRooms.json();

    const updatedRoom = verifyBody.rooms.find(
        r => String(r.roomid) === String(roomId)
);

    expect(updatedRoom).toBeTruthy();
    expect(updatedRoom.roomPrice).toBe(999);

    console.log('Checking the updated room:', updatedRoom);


// DELETE ROOM

  const deleteRoom = await request.delete(`/api/room/${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    }
  });

  expect(deleteRoom.status()).toBe(200);
  console.log('The room is deleted:', await deleteRoom.json());


// VERIFY DELETE

  const finalRooms = await request.get('/api/room');
  const finalBody = await finalRooms.json();

  console.log('List of rooms after deletion:', finalBody);

  const deletedRoom = finalBody.rooms.find(
    r => r.roomid === roomId
  );

  expect(deletedRoom).toBeUndefined();
});
