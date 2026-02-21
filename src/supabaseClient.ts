import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipxhctbdpdpfifmfgynm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweGhjdGJkcGRwZmlmbWZneW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTk0NjcsImV4cCI6MjA4NjgzNTQ2N30.47WccNI6OMVY4ltQt_kGrHYcVWeiThvEwRILk5DsySo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
