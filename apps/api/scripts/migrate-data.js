import 'dotenv/config';
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEV_POCKETBASE_URL = process.env.DEV_POCKETBASE_URL || 'http://127.0.0.1:8090';
const LIVE_POCKETBASE_URL = process.env.LIVE_POCKETBASE_URL || 'http://localhost:8090';
const LIVE_POCKETBASE_ADMIN_EMAIL = process.env.LIVE_POCKETBASE_ADMIN_EMAIL || 'lynn@greatwildlifephotos.com';
const LIVE_POCKETBASE_ADMIN_PASSWORD = process.env.LIVE_POCKETBASE_ADMIN_PASSWORD || '4Dg^Yu^nm2K!&xLqP@@IaS';
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 500;

// Logger utility
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
};

// Statistics
const stats = {
  totalCollections: 0,
  totalRecords: 0,
  createdRecords: 0,
  updatedRecords: 0,
  failedRecords: 0,
  filesUploaded: 0,
  filesFailed: 0,
  errors: [],
};

// Initialize PocketBase clients
let devPb;
let livePb;

// Collections to skip (system collections)
const SKIP_COLLECTIONS = [
  '_pb_users_auth_',
  'pocketbase_migrations',
  'pocketbase_mlog',
];

/**
 * Initialize PocketBase connections
 */
async function initializePocketBase() {
  logger.info(`Connecting to dev PocketBase at ${DEV_POCKETBASE_URL}`);
  devPb = new PocketBase(DEV_POCKETBASE_URL);

  logger.info(`Connecting to live PocketBase at ${LIVE_POCKETBASE_URL}`);
  livePb = new PocketBase(LIVE_POCKETBASE_URL);

  // Authenticate with live PocketBase as admin
  logger.info('Authenticating with live PocketBase admin account');
  await livePb.admins.authWithPassword(LIVE_POCKETBASE_ADMIN_EMAIL, LIVE_POCKETBASE_ADMIN_PASSWORD);

  logger.success('PocketBase connections initialized');
}

/**
 * Get all collections from dev instance
 */
async function getCollections() {
  logger.info('Fetching collections from dev instance');
  const collections = await devPb.collections.getFullList();
  const filteredCollections = collections.filter(
    (col) => !SKIP_COLLECTIONS.includes(col.name)
  );
  logger.success(`Found ${filteredCollections.length} collections to migrate`);
  return filteredCollections;
}

/**
 * Download file from dev instance
 */
async function downloadFile(collectionName, recordId, filename) {
  const fileUrl = `${DEV_POCKETBASE_URL}/api/files/${collectionName}/${recordId}/${filename}`;
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  return await response.arrayBuffer();
}

/**
 * Upload file to live instance
 */
async function uploadFile(collectionName, recordId, filename, fileBuffer) {
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
  formData.append(filename, blob, filename);

  const response = await fetch(
    `${LIVE_POCKETBASE_URL}/api/collections/${collectionName}/records/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': livePb.authStore.token,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.status}`);
  }

  stats.filesUploaded++;
  return true;
}

/**
 * Get field type from collection schema
 */
function getFieldType(collection, fieldName) {
  const field = collection.schema.find((f) => f.name === fieldName);
  return field ? field.type : null;
}

/**
 * Process file fields in a record
 */
async function processFileFields(collection, record) {
  const fileFields = collection.schema
    .filter((field) => field.type === 'file')
    .map((field) => field.name);

  for (const fieldName of fileFields) {
    const fileValue = record[fieldName];

    if (!fileValue) continue;

    // Handle both single file and multiple files
    const filenames = Array.isArray(fileValue) ? fileValue : [fileValue];

    for (const filename of filenames) {
      if (!filename) continue;

      logger.info(`Downloading file: ${collection.name}/${record.id}/${filename}`);
      const fileBuffer = await downloadFile(collection.name, record.id, filename);

      if (fileBuffer && !DRY_RUN) {
        logger.info(`Uploading file: ${filename} to live instance`);
        await uploadFile(collection.name, record.id, fieldName, fileBuffer);
      }
    }
  }
}

/**
 * Prepare record data for migration
 */
function prepareRecordData(collection, record) {
  const data = {};

  for (const field of collection.schema) {
    const fieldName = field.name;
    const fieldValue = record[fieldName];

    // Skip system fields
    if (['id', 'created', 'updated', 'collectionId', 'collectionName'].includes(fieldName)) {
      continue;
    }

    // Skip file fields (handled separately)
    if (field.type === 'file') {
      continue;
    }

    // Handle different field types
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'select':
        data[fieldName] = fieldValue || '';
        break;

      case 'number':
        data[fieldName] = fieldValue !== null && fieldValue !== undefined ? fieldValue : 0;
        break;

      case 'bool':
        data[fieldName] = fieldValue === true;
        break;

      case 'date':
      case 'autodate':
        data[fieldName] = fieldValue || '';
        break;

      case 'json':
        data[fieldName] = fieldValue ? JSON.stringify(fieldValue) : '{}';
        break;

      case 'relation':
        // Preserve relation IDs as-is
        if (Array.isArray(fieldValue)) {
          data[fieldName] = fieldValue;
        } else if (fieldValue) {
          data[fieldName] = [fieldValue];
        } else {
          data[fieldName] = [];
        }
        break;

      default:
        data[fieldName] = fieldValue || '';
    }
  }

  return data;
}

/**
 * Check if record exists in live instance
 */
async function recordExists(collectionName, recordId) {
  try {
    await livePb.collection(collectionName).getOne(recordId);
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Migrate a single record
 */
async function migrateRecord(collection, record) {
  const recordData = prepareRecordData(collection, record);
  const exists = await recordExists(collection.name, record.id);

  if (DRY_RUN) {
    if (exists) {
      logger.info(`[DRY-RUN] Would update record: ${collection.name}/${record.id}`);
    } else {
      logger.info(`[DRY-RUN] Would create record: ${collection.name}/${record.id}`);
    }
  } else {
    if (exists) {
      await livePb.collection(collection.name).update(record.id, recordData);
      stats.updatedRecords++;
      logger.info(`Updated record: ${collection.name}/${record.id}`);
    } else {
      await livePb.collection(collection.name).create({
        id: record.id,
        ...recordData,
      });
      stats.createdRecords++;
      logger.info(`Created record: ${collection.name}/${record.id}`);
    }

    // Process file fields after record is created/updated
    await processFileFields(collection, record);
  }
}

/**
 * Migrate all records in a collection
 */
async function migrateCollection(collection) {
  logger.info(`\n========== Migrating collection: ${collection.name} ==========`);

  let page = 1;
  let totalRecords = 0;
  let hasMore = true;

  while (hasMore) {
    const records = await devPb.collection(collection.name).getList(page, BATCH_SIZE);

    if (records.items.length === 0) {
      hasMore = false;
      break;
    }

    totalRecords += records.items.length;
    logger.info(`Processing batch ${page} (${records.items.length} records)`);

    for (const record of records.items) {
      try {
        await migrateRecord(collection, record);
      } catch (error) {
        stats.failedRecords++;
        const errorMsg = `Failed to migrate record ${collection.name}/${record.id}: ${error.message}`;
        logger.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    if (records.items.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      page++;
    }
  }

  logger.success(`Completed collection: ${collection.name} (${totalRecords} records)`);
  stats.totalRecords += totalRecords;
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n');
  console.log('========================================');
  console.log('         MIGRATION SUMMARY');
  console.log('========================================');
  console.log(`Total Collections: ${stats.totalCollections}`);
  console.log(`Total Records Processed: ${stats.totalRecords}`);
  console.log(`Records Created: ${stats.createdRecords}`);
  console.log(`Records Updated: ${stats.updatedRecords}`);
  console.log(`Records Failed: ${stats.failedRecords}`);
  console.log(`Files Uploaded: ${stats.filesUploaded}`);
  console.log(`Files Failed: ${stats.filesFailed}`);
  console.log(`Dry Run Mode: ${DRY_RUN ? 'YES' : 'NO'}`);
  console.log('========================================');

  if (stats.errors.length > 0) {
    console.log('\nErrors encountered:');
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log('\n');
}

/**
 * Main migration function
 */
async function runMigration() {
  logger.info('========== DATA MIGRATION STARTED ==========');
  logger.info(`Dev PocketBase: ${DEV_POCKETBASE_URL}`);
  logger.info(`Live PocketBase: ${LIVE_POCKETBASE_URL}`);
  logger.info(`Dry Run Mode: ${DRY_RUN}`);

  // Initialize connections
  await initializePocketBase();

  // Get collections
  const collections = await getCollections();
  stats.totalCollections = collections.length;

  // Migrate each collection
  for (const collection of collections) {
    await migrateCollection(collection);
  }

  // Print summary
  printSummary();

  logger.success('========== DATA MIGRATION COMPLETED ==========');
  process.exit(0);
}

// Run migration
runMigration();