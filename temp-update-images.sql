-- Update roleplay images to use local assets instead of broken Supabase storage URLs
UPDATE roleplays SET image = '/images/AskForRaise.png' WHERE id = '64c4f056-5b2a-480b-af93-1d7994ca6a0d';
UPDATE roleplays SET image = '/images/cover_roleplat.png' WHERE id = '2c27a5c6-6277-4783-a53b-1be940a80d1b';
UPDATE roleplays SET image = '/images/BanhmiVietnam.png' WHERE id = 'f24ded17-b9ac-494e-96c7-ee056788d0c6';
UPDATE roleplays SET image = '/images/VietnamIndependence.png' WHERE id = 'fdc5fe8b-ac4a-4a7f-a2ad-efad035f2118';