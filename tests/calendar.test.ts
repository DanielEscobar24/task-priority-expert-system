import test from 'node:test';
import assert from 'node:assert/strict';
import {dateKey,moveDays,validDateKey,weekDays} from '../src/lib/calendar';
test('semanas lunes a domingo y cambio de año',()=>{
 const dates=weekDays(new Date(2027,0,3,12));
 assert.equal(dateKey(dates[0]),'2026-12-28');assert.equal(dateKey(dates[6]),'2027-01-03');
 assert.equal(dateKey(moveDays(dates[0],7)),'2027-01-04');
 assert.equal(dateKey(moveDays(moveDays(dates[0],7),-7)),'2026-12-28');
});
test('valida fecha real sin aceptar normalización de días inexistentes',()=>{
 assert.equal(validDateKey('2028-02-29'),true);assert.equal(validDateKey('2027-02-29'),false);
 assert.equal(validDateKey('2026-11-31'),false);assert.equal(validDateKey('2026-13-01'),false);
 assert.equal(validDateKey('07/11/2026'),false);assert.equal(validDateKey('2026-11-07'),true);
});
