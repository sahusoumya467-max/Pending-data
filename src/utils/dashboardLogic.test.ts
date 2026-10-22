import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    authenticateUser, 
    getTimeOfDay, 
    getTimedWelcomeContent, 
    TIMING_WISE_CONTENT 
} from './dashboardLogic';

test('authenticateUser: validates master password correctly', () => {
    const res1 = authenticateUser('Credit@123');
    assert.equal(res1.success, true);
    assert.equal(res1.user, 'MASTER');

    const res2 = authenticateUser('Soumya@123');
    assert.equal(res2.success, true);
    assert.equal(res2.user, 'MASTER');
});

test('authenticateUser: validates branch names case-insensitively', () => {
    const res1 = authenticateUser('odagaon');
    assert.equal(res1.success, true);
    assert.equal(res1.user, 'Odagaon');

    const res2 = authenticateUser('ASKA');
    assert.equal(res2.success, true);
    assert.equal(res2.user, 'Aska');
});

test('getTimeOfDay: correctly categorizes all 24 hours', () => {
    // Morning: 5 to 11
    assert.equal(getTimeOfDay(5), 'morning');
    assert.equal(getTimeOfDay(9), 'morning');
    assert.equal(getTimeOfDay(11), 'morning');

    // Afternoon: 12 to 16
    assert.equal(getTimeOfDay(12), 'afternoon');
    assert.equal(getTimeOfDay(14), 'afternoon');
    assert.equal(getTimeOfDay(16), 'afternoon');

    // Evening: 17 to 20
    assert.equal(getTimeOfDay(17), 'evening');
    assert.equal(getTimeOfDay(19), 'evening');
    assert.equal(getTimeOfDay(20), 'evening');

    // Night: 21 to 4
    assert.equal(getTimeOfDay(21), 'night');
    assert.equal(getTimeOfDay(23), 'night');
    assert.equal(getTimeOfDay(0), 'night');
    assert.equal(getTimeOfDay(4), 'night');
});

test('getTimedWelcomeContent: provides valid content for each time period', () => {
    const hours = [8, 13, 18, 22]; // morning, afternoon, evening, night
    for (const h of hours) {
        const content = getTimedWelcomeContent(h);
        assert.ok(content.image.startsWith('https://images.unsplash.com'));
        assert.ok(content.shayari.length > 20);
        assert.ok(content.badge.length > 0);
        assert.ok(content.greeting.includes('Welcome to Credit'));
    }
});

test('getTimedWelcomeContent: changes selection and avoids immediate repeat when possible', () => {
    const first = getTimedWelcomeContent(8, -1);
    const second = getTimedWelcomeContent(8, first.index);
    assert.notEqual(first.index, second.index);
});
