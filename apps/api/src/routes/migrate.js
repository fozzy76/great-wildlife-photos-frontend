import 'dotenv/config';
import express from 'express';
import PocketBase from 'pocketbase';
import logger from '../utils/logger.js';

const router = express.Router();

// Target collections for sync
const TARGET_COLLECTIONS = [
  'users',
  'products',
  'orders',
  'collections',
  'customers',
];

const BATCH_SIZE = 500;
const TIMEOUT_MS = 30000; // 30 second timeout for fetch operations

/**
 * Convert error to readable string
 */
function errorToString(error) {
  if (error && error.message) {
    return error.message;
  }
  if (error && typeof error.toString === 'function') {
    const str = error.toString();
    if (str && str !== '[object Object]') {
      return str;
    }
  }
  return String(error) || 'Unknown error occurred';
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Initialize PocketBase clients with user token
 * Both test and live instances use the same user token
 */
async function initializePocketBaseClients(userToken) {
  const testUrl = process.env.DEV_PB_URL || 'http://127.0.0.1:8090';
  const liveUrl = process.env.LIVE_POCKETBASE_URL || 'http://localhost:8090';

  logger.info(`Initializing PocketBase clients`);
  logger.info(`Test PocketBase: ${testUrl}`);
  logger.info(`Live PocketBase: ${liveUrl}`);

  // Initialize test PocketBase client with user token
  logger.info('Step 1: Initializing test PocketBase client with user token');
  let testPb;
  try {
    testPb = new PocketBase(testUrl);
    testPb.authStore.save(userToken);
    // Test connection by fetching collections
    await testPb.collections.getFullList();
    logger.success('Test PocketBase client initialized with user token');
  } catch (error) {
    const errorMsg = errorToString(error);
    logger.error(`Test PocketBase initialization failed: ${errorMsg}`);
    // Check if it's a permission error
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('permission')) {
      throw new Error('User does not have permission to access test environment data');
    }
    throw new Error(`Test environment authentication failed: ${errorMsg}`);
  }

  // Initialize live PocketBase client with user token
  logger.info('Step 2: Initializing live PocketBase client with user token');
  let livePb;
  try {
    livePb = new PocketBase(liveUrl);
    livePb.authStore.save(userToken);
    // Test connection by fetching collections
    await livePb.collections.getFullList();
    logger.success('Live PocketBase client initialized with user token');
  } catch (error) {
    const errorMsg = errorToString(error);
    logger.error(`Live PocketBase initialization failed: ${errorMsg}`);
    // Check if it's a permission error
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('permission')) {
      throw new Error('User does not have permission to access live environment data');
    }
    throw new Error(`Live environment authentication failed: ${errorMsg}`);
  }

  logger.success('Both PocketBase connections initialized successfully');
  return { testPb, livePb, testUrl, liveUrl };
}

/**
 * Download file from test instance
 */
async function downloadFile(testUrl, userToken, collectionName, recordId, filename) {
  const fileUrl = `${testUrl}/api/files/${collectionName}/${recordId}/${filename}`;
  logger.info(`Downloading file from: ${fileUrl}`);

  const response = await fetchWithTimeout(fileUrl, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  logger.info(`Successfully downloaded file: ${filename} (${buffer.byteLength} bytes)`);
  return buffer;
}

/**
 * Upload file to live instance
 */
async function uploadFile(liveUrl, userToken, collectionName, recordId, filename, fileBuffer) {
  logger.info(`Uploading file ${filename} to live instance (${fileBuffer.byteLength} bytes)`);

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
  formData.append(filename, blob, filename);

  const response = await fetchWithTimeout(
    `${liveUrl}/api/collections/${collectionName}/records/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = 'Unable to read error response';
    }
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
  }

  logger.success(`Successfully uploaded file: ${filename} to ${collectionName}/${recordId}`);
  return true;
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
 * Process file fields in a record
 */
async function processFileFields(testUrl, liveUrl, userToken, collection, record, stats) {
  const fileFields = collection.schema
    .filter((field) => field.type === 'file')
    .map((field) => field.name);

  if (fileFields.length === 0) {
    return;
  }

  logger.info(`Processing ${fileFields.length} file field(s) for record ${record.id}`);

  for (const fieldName of fileFields) {
    const fileValue = record[fieldName];

    if (!fileValue) {
      logger.info(`File field ${fieldName} is empty, skipping`);
      continue;
    }

    // Handle both single file and multiple files
    const filenames = Array.isArray(fileValue) ? fileValue : [fileValue];

    for (const filename of filenames) {
      if (!filename) continue;

      try {
        const fileBuffer = await downloadFile(testUrl, userToken, collection.name, record.id, filename);
        await uploadFile(liveUrl, userToken, collection.name, record.id, fieldName, fileBuffer);
        stats.filesTransferred++;
      } catch (error) {
        const errorMsg = `File transfer failed for ${filename} in ${collection.name}/${record.id}: ${errorToString(error)}`;
        logger.error(errorMsg);
        stats.errors.push(errorMsg);
        stats.totalErrors++;
        // Continue with next file instead of failing entire record
      }
    }
  }
}

/**
 * Sync records from test to live for a single collection
 */
async function syncCollection(testUrl, liveUrl, testPb, livePb, userToken, collectionName, stats) {
  logger.info(`\n========== Syncing collection: ${collectionName} ==========`);

  // Get collection schema from test instance
  const testCollection = await testPb.collections.getOne(collectionName);
  logger.info(`Retrieved schema for collection: ${collectionName}`);

  // Fetch all records from test collection
  logger.info(`Fetching all records from test collection: ${collectionName}`);
  const testRecords = await testPb.collection(collectionName).getFullList();
  logger.info(`Retrieved ${testRecords.length} records from ${collectionName}`);

  if (testRecords.length === 0) {
    logger.info(`No records to sync in collection: ${collectionName}`);
    stats.migratedRecords[collectionName] = 0;
    return;
  }

  let migratedCount = 0;

  // Sync each record
  for (const record of testRecords) {
    logger.info(`Syncing record ${record.id} from ${collectionName}`);

    // Prepare record data
    const recordData = prepareRecordData(testCollection, record);

    // Check if record exists in live instance
    let recordExists = false;
    try {
      await livePb.collection(collectionName).getOne(record.id);
      recordExists = true;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    if (recordExists) {
      // Update existing record
      await livePb.collection(collectionName).update(record.id, recordData);
      logger.info(`Updated record: ${collectionName}/${record.id}`);
    } else {
      // Create new record
      await livePb.collection(collectionName).create({
        id: record.id,
        ...recordData,
      });
      logger.info(`Created record: ${collectionName}/${record.id}`);
    }

    migratedCount++;

    // Process file fields after record is created/updated
    await processFileFields(testUrl, liveUrl, userToken, testCollection, record, stats);
  }

  logger.success(`Completed syncing collection: ${collectionName} (${migratedCount} records)`);
  stats.migratedRecords[collectionName] = migratedCount;
}

/**
 * POST /migrate/sync-test-to-live
 * Sync data from test/preview environment to live environment
 *
 * Authentication:
 * - Uses user's session token from Authorization header (Bearer TOKEN)
 * - Same token is used for both test and live PocketBase instances
 *
 * Collections synced:
 * - users
 * - products
 * - orders
 * - collections
 * - customers
 *
 * Response Format:
 * Success (200):
 * {
 *   success: true,
 *   migratedRecords: {
 *     users: number,
 *     products: number,
 *     orders: number,
 *     collections: number,
 *     customers: number
 *   }
 * }
 *
 * Error (403/500):
 * {
 *   success: false,
 *   error: 'error message'
 * }
 */
router.post('/sync-test-to-live', async (req, res) => {
  logger.info('\n\n========== TEST TO LIVE SYNC STARTED ==========');
  logger.info(`Timestamp: ${new Date().toISOString()}`);

  // Extract user's session token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header. Please provide a valid Bearer token.');
  }

  const userToken = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!userToken || userToken.trim() === '') {
    throw new Error('Authorization token is empty. Please provide a valid session token.');
  }

  logger.info('User session token extracted from Authorization header');

  let testPb;
  let livePb;
  let testUrl;
  let liveUrl;

  // Initialize statistics
  const stats = {
    migratedRecords: {},
    filesTransferred: 0,
    totalErrors: 0,
    errors: [],
  };

  // Initialize collection counts
  for (const collectionName of TARGET_COLLECTIONS) {
    stats.migratedRecords[collectionName] = 0;
  }

  // Initialize connections
  logger.info('Step 1: Initializing PocketBase connections with user token');
  const initResult = await initializePocketBaseClients(userToken);

  testPb = initResult.testPb;
  livePb = initResult.livePb;
  testUrl = initResult.testUrl;
  liveUrl = initResult.liveUrl;

  logger.info(`Test PocketBase: ${testUrl}`);
  logger.info(`Live PocketBase: ${liveUrl}`);

  // Sync each target collection
  logger.info(`Step 2: Starting sync of ${TARGET_COLLECTIONS.length} target collection(s)`);
  logger.info(`Target collections: ${TARGET_COLLECTIONS.join(', ')}`);

  for (const collectionName of TARGET_COLLECTIONS) {
    logger.info(`Processing collection: ${collectionName}`);
    await syncCollection(testUrl, liveUrl, testPb, livePb, userToken, collectionName, stats);
  }

  logger.success('========== TEST TO LIVE SYNC COMPLETED ==========');
  logger.info(`Final statistics: ${JSON.stringify(stats.migratedRecords, null, 2)}`);

  // Build response object
  const successResponse = {
    success: true,
    migratedRecords: stats.migratedRecords,
  };

  logger.info('MIGRATE RESPONSE:', JSON.stringify(successResponse, null, 2));

  res.json(successResponse);
});

export default router;