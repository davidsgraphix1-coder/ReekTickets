#!/usr/bin/env bash
set -e

echo "Installing required packages for Supabase ticket scanning and migration audit..."
npm install jsqr

echo "Scanning project for legacy backend API endpoint usage..."
grep -R --line-number --exclude-dir=node_modules -E 'API_BASE|BACKEND_BASE_URL|axios\.|fetch\(|/api/' src | sort | uniq > supabase-endpoint-report.txt

echo "Report saved to supabase-endpoint-report.txt"
echo "Review the report and replace legacy endpoint calls with Supabase queries in src/services/api.js or direct Supabase client calls."
echo "Apply the Supabase schema with create_supabase_tables.sql in your Supabase project."
echo "If using Supabase Storage for avatar uploads, create a public bucket named 'avatars'."
echo "Set environment variables: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
