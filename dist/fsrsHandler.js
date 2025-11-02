"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReview = handleReview;
var ts_fsrs_1 = require("ts-fsrs");
var db_1 = require("./lib/db"); // your singleton client
var scheduler = (0, ts_fsrs_1.fsrs)();
/**
 * Handles a user review for a given flashcard.
 * Fetches, updates, and logs using Supabase.
 */
function handleReview(flashcard_id, ratingValue) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, status, fetchError, card, now, rating, _b, updated, log, updateError, logError;
        var _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0: return [4 /*yield*/, db_1.db
                        .from("flashcard_status")
                        .select("*")
                        .eq("flashcard_id", flashcard_id)
                        .single()];
                case 1:
                    _a = _k.sent(), status = _a.data, fetchError = _a.error;
                    if (fetchError || !status)
                        throw new Error("Flashcard status not found");
                    card = {
                        due: new Date(status.next_review_at || Date.now()),
                        stability: (_c = status.stability) !== null && _c !== void 0 ? _c : 0,
                        difficulty: (_d = status.difficulty) !== null && _d !== void 0 ? _d : 0.3,
                        elapsed_days: (_e = status.elapsed_days) !== null && _e !== void 0 ? _e : 0,
                        scheduled_days: (_f = status.scheduled_days) !== null && _f !== void 0 ? _f : 0,
                        learning_steps: (_g = status.learning_steps) !== null && _g !== void 0 ? _g : 0,
                        reps: (_h = status.repetitions) !== null && _h !== void 0 ? _h : 0,
                        lapses: (_j = status.lapses) !== null && _j !== void 0 ? _j : 0,
                        state: mapState(status.state),
                        last_review: status.last_review_at ? new Date(status.last_review_at) : new Date(),
                    };
                    now = new Date();
                    rating = mapRating(ratingValue);
                    _b = scheduler.next(card, now, rating), updated = _b.card, log = _b.log;
                    return [4 /*yield*/, db_1.db
                            .from("flashcard_status")
                            .update({
                            next_review_at: updated.due.toISOString(),
                            stability: updated.stability,
                            difficulty: updated.difficulty,
                            elapsed_days: updated.elapsed_days,
                            scheduled_days: updated.scheduled_days,
                            learning_steps: updated.learning_steps,
                            repetitions: updated.reps,
                            lapses: updated.lapses,
                            state: reverseMapState(updated.state),
                            last_review_at: now.toISOString(),
                            updated_at: now.toISOString(),
                        })
                            .eq("flashcard_id", flashcard_id)];
                case 2:
                    updateError = (_k.sent()).error;
                    if (updateError)
                        throw updateError;
                    return [4 /*yield*/, db_1.db
                            .from("fsrs_review_logs")
                            .insert({
                            card_id: status.id,
                            rating: ts_fsrs_1.Rating[rating].toLocaleLowerCase(),
                            state: status.state,
                            review_date: now.toISOString(),
                            elapsed_days: log.elapsed_days,
                            scheduled_days: log.scheduled_days,
                            stability_before: log.stability,
                            difficulty_before: log.difficulty,
                            created_at: now.toISOString(),
                        })];
                case 3:
                    logError = (_k.sent()).error;
                    if (logError)
                        throw logError;
                    // ✅ Return summary
                    return [2 /*return*/, {
                            flashcard_id: flashcard_id,
                            next_review_at: updated.due,
                            stability: updated.stability,
                            difficulty: updated.difficulty,
                        }];
            }
        });
    });
}
/** 🔸 Map DB state (string) to FSRS state (number) */
function mapState(state) {
    switch (state) {
        case "new": return 0;
        case "learning": return 1;
        case "review": return 2;
        case "relearning": return 3;
        default: return 0;
    }
}
/** 🔸 Map FSRS state (number) back to DB string */
function reverseMapState(state) {
    var _a;
    return (_a = ["new", "learning", "review", "relearning"][state]) !== null && _a !== void 0 ? _a : "new";
}
/** 🔸 Convert user rating (1–4) to FSRS Rating enum */
function mapRating(value) {
    switch (value) {
        case 1: return ts_fsrs_1.Rating.Again;
        case 2: return ts_fsrs_1.Rating.Hard;
        case 3: return ts_fsrs_1.Rating.Good;
        case 4: return ts_fsrs_1.Rating.Easy;
        default: throw new Error("Invalid rating");
    }
}
