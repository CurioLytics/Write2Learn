"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
// 🚨 Use the *service role key*, not the anon key
exports.db = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
