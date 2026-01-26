# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Node.js/Express API server for a timesheet management system built for an Indonesian manufacturing environment. The system handles employee check-in/check-out operations for production orders and work centers.

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Dependencies**: cors, dotenv, pg (node-postgres driver)

## Database Schema
The system works with several PostgreSQL tables:
- `sowkk` - Production order activities
- `workcenterkk` - Work center definitions  
- `timesheet_transaction` - Main timesheet records with check-in/check-out data

Key fields in timesheet_transaction:
- `tsnumber` - Primary transaction identifier
- `production_order`, `serialnumber`, `full_name` - Employee/order info
- `seq`, `operation_text` - Activity details
- `workcentercode`, `workcenterdescription` - Machine/work center
- `longdate_checkin`/`longdate_checkout` - Timestamp fields
- `date_checkin`/`date_checkout` - Formatted date strings (dd/mm/yyyy)
- `hour_checkin`/`hour_checkout` - Time strings (hh:mm)

## Key API Endpoints
- `GET /sowkk` - Fetch production order activities
- `GET /workcenterkk` - Get work center data
- `POST /timesheet/checkin` - Employee check-in (from frontend sessionStorage)
- `PUT /timesheet/checkout` - Employee check-out by serialnumber
- `PUT /timesheet/checkouts` - Employee check-out by tsnumber
- `POST /timesheet/checkinid` - Direct check-in with provided data
- `GET /timesheetget` - Retrieve timesheet history by serialnumber

## Development Commands
```bash
# Start the server
node server.js

# Install dependencies
npm install
```

## Environment Configuration
Database configuration is handled via `.env` file with PostgreSQL connection details. The hardcoded plant identifier is "5071" (stored in `plantssb` variable).

## Code Patterns
- All database operations use parameterized queries for security
- Date/time handling creates both timestamp and formatted string versions
- Error responses are in Indonesian ("Terjadi error saat ambil data")
- Two similar checkout endpoints exist for different use cases (by serialnumber vs tsnumber)