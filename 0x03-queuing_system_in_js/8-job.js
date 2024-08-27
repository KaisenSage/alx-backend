import kue from 'kue';

/**
 * Create jobs for push notifications and add them to the Kue queue.
 * 
 * @param {Array} jobs - An array of job objects.
 * @param {Object} queue - The Kue queue.
 */
export default function createPushNotificationsJobs(jobs, queue) {
    if (!Array.isArray(jobs)) {
        throw new Error('Jobs is not an array');
    }

    jobs.forEach((job) => {
        const jobItem = queue.create('push_notification_code_3', job)
            .save((err) => {
                if (!err) {
                    console.log(`Notification job created: ${jobItem.id}`);
                }
            });

        jobItem.on('complete', () => {
            console.log(`Notification job ${jobItem.id} completed`);
        }).on('failed', (err) => {
            console.log(`Notification job ${jobItem.id} failed: ${err}`);
        }).on('progress', (progress) => {
            console.log(`Notification job ${jobItem.id} ${progress}% complete`);
        });
    });
}

