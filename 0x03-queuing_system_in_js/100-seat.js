import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';
import kue from 'kue';

// Express setup
const app = express();
const port = 1245;

// Redis setup
const client = createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Kue setup
const queue = kue.createQueue();

// Initialize seat availability and reservation status
let reservationEnabled = true;
const initialSeats = 50;

// Function to reserve seats
async function reserveSeat(number) {
    await setAsync('available_seats', number);
}

// Function to get the current number of available seats
async function getCurrentAvailableSeats() {
    const seats = await getAsync('available_seats');
    return parseInt(seats, 10);
}

// Initialize available seats when the server starts
reserveSeat(initialSeats);

// Route to get the number of available seats
app.get('/available_seats', async (req, res) => {
    const numberOfAvailableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats });
});

// Route to reserve a seat
app.get('/reserve_seat', (req, res) => {
    if (!reservationEnabled) {
        return res.json({ status: 'Reservations are blocked' });
    }

    const job = queue.create('reserve_seat').save((err) => {
        if (!err) {
            res.json({ status: 'Reservation in process' });
        } else {
            res.json({ status: 'Reservation failed' });
        }
    });

    job.on('complete', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    }).on('failed', (err) => {
        console.log(`Seat reservation job ${job.id} failed: ${err}`);
    });
});

// Route to process the queue
app.get('/process', (req, res) => {
    res.json({ status: 'Queue processing' });

    queue.process('reserve_seat', async (job, done) => {
        const currentSeats = await getCurrentAvailableSeats();

        if (currentSeats <= 0) {
            reservationEnabled = false;
            return done(new Error('Not enough seats available'));
        }

        await reserveSeat(currentSeats - 1);

        if (currentSeats - 1 === 0) {
            reservationEnabled = false;
        }

        done();
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

