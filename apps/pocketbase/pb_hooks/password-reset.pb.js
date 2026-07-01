/// <reference path="../pb_data/types.d.ts" />
onRecordAuthRequest((e) => {
  // This hook is triggered after successful authentication
  // For password reset, you'll need to implement a custom endpoint that:
  // 1. Generates a reset token
  // 2. Stores it temporarily
  // 3. Sends the reset email
  // This is a placeholder for the password reset email logic
  
  // Note: Password reset typically requires a custom endpoint since PocketBase
  // doesn't have a built-in password reset hook. You would call this from your
  // backend when a user requests a password reset.
  
  e.next();
}, "customers");