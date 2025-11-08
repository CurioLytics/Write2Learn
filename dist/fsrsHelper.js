"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextReview = getNextReview;
var ts_fsrs_1 = require("ts-fsrs");
// Initialize FSRS engine once
var scheduler = (0, ts_fsrs_1.fsrs)();
/**
 * Update a word card based on user grade and return the next review date
 * @param card - the current word card with FSRS fields
 * @param grade - user grade (Grade.Again, Grade.Hard, Grade.Good, Grade.Easy)
 * @returns updated card with next review time
 */
function getNextReview(card, grade) {
    var now = new Date();
    var updatedCard = scheduler.next(card, now, grade).card;
    // Preserve word and meaning
    return __assign(__assign({}, updatedCard), { word: card.word, meaning: card.meaning });
}
