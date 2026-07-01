# Data Migration Script

This script syncs all data from a development PocketBase instance to a live PocketBase instance.

## Features

- **Batch Processing**: Fetches records in batches of 500 to handle large datasets efficiently
- **Smart Record Handling**: Creates new records and updates existing ones based on ID
- **File Upload Support**: Automatically downloads files from dev instance and re-uploads to live instance
- **Relation Preservation**: Maintains relation IDs as-is (assumes related records exist or will be created)
- **Data Type Support**: Handles all PocketBase field types (text, email, number, bool, date, select, json, file, relation, autodate)
- **Detailed Logging**: Comprehensive progress logging for each collection and record
- **Error Handling**: Catches and logs errors per record without stopping the entire migration
- **Dry Run Mode**: Preview what would be migrated without actually writing data
- **Migration Summary**: Detailed statistics at the end including success/failure counts

## Prerequisites

1. Node.js 16+ installed
2. Both dev and live PocketBase instances running
3. Admin credentials for the live PocketBase instance

## Installation

```bash
cd apps/api/scripts
npm install
```

## Configuration

Set the following environment variables in `apps/api/.env` or export them:

```bash
# Development PocketBase (defaults to http://127.0.0.1:8090)
DEV_POCKETBASE_URL=http://127.0.0.1:8090

# Live PocketBase (defaults to http://localhost:8090)
LIVE_POCKETBASE_URL=http://your-live-pocketbase.com

# Live PocketBase admin credentials
LIVE_POCKETBASE_ADMIN_EMAIL=admin@example.com
LIVE_POCKETBASE_ADMIN_PASSWORD=your_admin_password
```

## Usage

### Dry Run (Preview)

Preview what would be migrated without actually writing data:

```bash
node migrate-data.js --dry-run
```

### Full Migration

Run the actual migration:

```bash
node migrate-data.js
```

### Using npm scripts

```bash
# Dry run
npm run migrate:dry-run

# Full migration
npm run migrate
```

## Output

The script provides detailed logging throughout the migration process:

```
[INFO] 2024-01-15T10:30:45.123Z - Connecting to dev PocketBase at http://127.0.0.1:8090
[INFO] 2024-01-15T10:30:45.456Z - Connecting to live PocketBase at http://your-live-pocketbase.com
[SUCCESS] 2024-01-15T10:30:46.789Z - PocketBase connections initialized
[INFO] 2024-01-15T10:30:47.012Z - Fetching collections from dev instance
[SUCCESS] 2024-01-15T10:30:47.345Z - Found 5 collections to migrate

========== Migrating collection: products ==========
[INFO] 2024-01-15T10:30:48.678Z - Processing batch 1 (500 records)
[INFO] 2024-01-15T10:30:49.012Z - Created record: products/abc123
[INFO] 2024-01-15T10:30:49.345Z - Updated record: products/def456
...

========================================
         MIGRATION SUMMARY
========================================
Total Collections: 5
Total Records Processed: 2500
Records Created: 1200
Records Updated: 1300
Records Failed: 0
Files Uploaded: 450
Files Failed: 0
Dry Run Mode: NO
========================================
```

## Migration Summary

At the end of the migration, you'll see a summary with:

- **Total Collections**: Number of collections migrated
- **Total Records Processed**: Total records across all collections
- **Records Created**: New records created in live instance
- **Records Updated**: Existing records updated in live instance
- **Records Failed**: Records that failed to migrate
- **Files Uploaded**: Files successfully uploaded
- **Files Failed**: Files that failed to upload
- **Dry Run Mode**: Whether this was a dry run or actual migration

## Error Handling

The script handles errors gracefully:

- Individual record failures don't stop the entire migration
- All errors are logged with details
- A summary of errors is printed at the end
- The script exits with code 1 if there are critical errors, 0 if successful

## Data Type Handling

The script properly handles all PocketBase field types:

| Field Type | Handling |
|-----------|----------|
| text | Copied as-is |
| email | Copied as-is |
| url | Copied as-is |
| number | Converted to number, defaults to 0 |
| bool | Converted to boolean |
| date | Copied as-is |
| autodate | Copied as-is |
| select | Copied as-is |
| json | Stringified if object, defaults to '{}' |
| file | Downloaded from dev, re-uploaded to live |
| relation | IDs preserved as-is |

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Verify both PocketBase instances are running
2. Check the URLs are correct
3. Ensure network connectivity between instances

### Authentication Errors

If you get authentication errors:

1. Verify admin email and password are correct
2. Ensure the admin account exists in the live instance
3. Check that the admin has sufficient permissions

### File Upload Errors

If files fail to upload:

1. Check file permissions on both instances
2. Verify disk space on live instance
3. Check file size limits in PocketBase configuration

### Relation Errors

If relations fail:

1. Ensure related records are migrated first
2. Check that relation IDs match between instances
3. Verify collection names are identical

## Performance Tips

- Run the migration during off-peak hours
- For very large datasets (>100k records), consider running in batches
- Monitor disk space on the live instance during file uploads
- Use dry-run mode first to identify potential issues

## Support

For issues or questions, check the logs for detailed error messages and ensure all prerequisites are met.