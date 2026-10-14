-- Live refresh when the roster or access changes
alter publication supabase_realtime add table attendance_members;
alter publication supabase_realtime add table app_users;
