import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    authenticateUser, 
    getTimeOfDay, 
    getTimedWelcomeContent, 
    TIMING_WISE_CONTENT,
    validateRating,
    getRatingLabel,
    calculateAverageRating,
    formatClientModalDetails,
    getFestivalAndOccasionInfo
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

test('validateRating: checks valid star rating values between 1 and 5', () => {
    assert.equal(validateRating(1), true);
    assert.equal(validateRating(5), true);
    assert.equal(validateRating(3), true);
    assert.equal(validateRating(0), false);
    assert.equal(validateRating(6), false);
    assert.equal(validateRating(3.5), false);
});

test('getRatingLabel: returns descriptive labels for ratings', () => {
    assert.ok(getRatingLabel(5).includes('Outstanding'));
    assert.ok(getRatingLabel(1).includes('Needs Improvement'));
});

test('calculateAverageRating: computes accurate average and count', () => {
    const res = calculateAverageRating([5, 4, 5, 5, 4]);
    assert.equal(res.average, 4.6);
    assert.equal(res.count, 5);
});

test('formatClientModalDetails: correctly formats client modal fields and handles fallbacks', () => {
    const populated = formatClientModalDetails('100234', 'Sunita Devi', 'Maa Tarini SHG', 'KYC image blank', 'Please re-upload voter ID');
    assert.equal(populated.loanId, '100234');
    assert.equal(populated.memberName, 'Sunita Devi');
    assert.equal(populated.groupName, 'Maa Tarini SHG');
    assert.equal(populated.subCategory, 'KYC image blank');
    assert.equal(populated.cmRemarks, 'Please re-upload voter ID');

    const empty = formatClientModalDetails('', '', '', '', '');
    assert.equal(empty.loanId, '-');
    assert.equal(empty.memberName, '-');
    assert.equal(empty.groupName, '-');
    assert.equal(empty.subCategory, 'None / Not Specified');
    assert.equal(empty.cmRemarks, 'No remarks recorded');
});

test('getFestivalAndOccasionInfo: correctly detects Diwali season for October 26', () => {
    const testDate = new Date(2026, 9, 26); // October is month index 9
    const info = getFestivalAndOccasionInfo(testDate);
    assert.equal(info.isFestival, true);
    assert.ok(info.occasionName.includes('Deepavali'));
    assert.ok(info.wishTitle.includes('Deepavali'));
    assert.equal(info.hasLightsSky, true);
    assert.equal(info.hasBalloons, true);
    assert.ok(info.formattedDate.includes('26 October 2026'));
});

test('getFestivalAndOccasionInfo: detects New Year, Republic Day, and Independence Day', () => {
    const ny = getFestivalAndOccasionInfo(new Date(2026, 0, 1)); // Jan 1
    assert.ok(ny.occasionName.includes('New Year'));

    const rep = getFestivalAndOccasionInfo(new Date(2026, 0, 26)); // Jan 26
    assert.ok(rep.occasionName.includes('Republic Day'));

    const ind = getFestivalAndOccasionInfo(new Date(2026, 7, 15)); // Aug 15
    assert.ok(ind.occasionName.includes('Independence Day'));
});

test('getFestivalAndOccasionInfo: provides auspicious daily wish on non-designated dates', () => {
    const regularDate = new Date(2026, 4, 10); // May 10
    const info = getFestivalAndOccasionInfo(regularDate);
    assert.equal(info.isFestival, false);
    assert.ok(info.wishTitle.includes('Auspicious Day'));
    assert.ok(info.formattedDate.includes('10 May 2026'));
    assert.equal(info.hasLightsSky, true);
    assert.equal(info.hasBalloons, true);
});

