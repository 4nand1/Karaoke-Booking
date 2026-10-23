import assert from "node:assert/strict"
import { nightNow, daySlots, localDate, isOpenAt, formatMNT } from "../src/lib/venue.ts"

const at = (h, m) => new Date(2026, 9, 23, h, m)
assert.deepEqual(nightNow("16:00", "05:00", at(1, 30)), { date: "2026-10-22", minutes: 1530 })
assert.deepEqual(nightNow("16:00", "05:00", at(20, 0)), { date: "2026-10-23", minutes: 1200 })
assert.equal(localDate(at(0, 30)), "2026-10-23")
assert.equal(daySlots("22:00", "02:00").map((s) => s.label).join(), "22:00,23:00,00:00,01:00")
assert.equal(isOpenAt("16:00", "05:00", at(3, 0)), true)
assert.equal(isOpenAt("11:00", "23:00", at(23, 30)), false)
assert.equal(formatMNT(40000), "₮40,000")
console.log("venue ok")
