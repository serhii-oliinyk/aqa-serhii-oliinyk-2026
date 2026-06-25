import { test, expect } from '@playwright/test';
import { getToken } from './auth';

test('Full CRUD + Booking room flow', async ({ request }) => {

  const token = await getToken(request);
  const roomName = `207-${Date.now().toString().slice(-2)}`;

// 1. CREATE ROOM
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
  console.log('Room is created', await createRoom.json());

// 2. GET ALL ROOMS
  const getRooms = await request.get('/api/room');
  const roomsBody = await getRooms.json();
  console.log('List of rooms:', roomsBody);

  const createdRoom = roomsBody.rooms.find(
    room => room.roomName === roomName
  );

  expect(createdRoom).toBeTruthy();
  const roomId = createdRoom.roomid;

// 3. BOOK ROOM

  const bookingResponse = await request.post('/api/booking', {
    data: {
      roomid: roomId,
      firstname: 'QAA',
      lastname: 'Dou-Tester',
      depositpaid: false,
      bookingdates: {
        checkin: '2026-04-20',
        checkout: '2026-04-22'
      },
      email: 'test@gmail.com',
      phone: '+380931234567'
    }
  });

  expect(bookingResponse.status()).toBe(201);
  const bookingBody = await bookingResponse.json();

  console.log('The room is successfully booked', bookingBody);

  const bookingId = bookingBody.bookingid;
  expect(bookingId).toBeTruthy();

  // 4. VERIFY BOOKING
  const adminBookings = await request.get(`/api/booking?roomid=${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    }
  });

  const adminBody = await adminBookings.json();
  console.log('Booking for room:', adminBody);

  const bookings = Array.isArray(adminBody)
    ? adminBody
    : adminBody.bookings ?? adminBody;
  const exists = Array.isArray(bookings)
    ? bookings.some(b => b.bookingid === bookingId)
    : bookings?.bookingid === bookingId;

  expect(exists).toBeTruthy();

// 5. EDIT ROOM

  const editRoom = await request.put(`/api/room/${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    },
    data: {
      roomName: roomName,
      type: 'Double',
      accessible: true,
      description: 'Updated room description',
      image: 'https://www.mwtestconsultancy.co.uk/img/room2.jpg',
      roomPrice: 999,
      features: ['WiFi', 'TV']
    }
  });

  expect(editRoom.status()).toBe(200);
  console.log('The room is successfully updated', await editRoom.json());

  // 6. VERIFY UPDATE

  const verifyRooms = await request.get('/api/room');
  const verifyBody = await verifyRooms.json();
  const updatedRoom = verifyBody.rooms.find(
    r => r.roomid === roomId
  );

  expect(updatedRoom).toBeTruthy();
  expect(updatedRoom.roomName).toBe(roomName);
  expect(updatedRoom.roomPrice).toBe(999);

  console.log('Checking the updated room:', updatedRoom);

// 7. DELETE ROOM (ADMIN API)

  const deleteRoom = await request.delete(`/api/room/${roomId}`, {
    headers: {
      'Cookie': `token=${token}`
    }
  });

  expect(deleteRoom.status()).toBe(200);
  console.log('The room is deleted:', await deleteRoom.json());


  // 8. VERIFY DELETED (USER API)

  const finalRooms = await request.get('/api/room');
  const finalBody = await finalRooms.json();
  const deletedRoom = finalBody.rooms.find(
    r => r.roomid === roomId
  );

  console.log('List of rooms after deletion:', finalBody);
  expect(deletedRoom).toBeUndefined();

});
