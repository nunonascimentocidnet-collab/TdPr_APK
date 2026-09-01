# Project Rules and Instructions

## Data Persistence & Backward Compatibility
- All shooting history, training sessions, and scheduled events are stored in a JSON-compatible format (likely IndexedDB or Firestore).
- **CRITICAL**: Maintain backward compatibility for all existing data.
- When updating data schemas or logic, ensure that old records (containing data, score, weapons, ammo, schedules, etc.) are NOT corrupted or invalidated.
- Always prefer optional fields or default values for new properties to avoid breaking existing entries.
