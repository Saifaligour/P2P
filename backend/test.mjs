// test-store.js
import {
  cleanup,
  createGroup,
  getAllGroupDetails,
  readMessagesFromStore,
  writeMessagesToStore
} from './store1.mjs';

async function runTests() {
  console.log('Starting tests...\n');

  // Test 1: Create Group
  console.log('=== Test 1: Create Group ===');
  const groupId = 'test-group-' + Date.now();
  const groupData = {
    groupId,
    name: 'Test Group',
    description: 'Test Description',
    members: ['user1', 'user2']
  };

  try {
    const createdGroup = await createGroup(groupData);
    console.log('✓ Group created successfully');
    console.log('Created Group:', createdGroup, '\n');
  } catch (err) {
    console.error('✗ Failed to create group:', err);
  }

  // Test 2: Write Messages
  console.log('=== Test 2: Write Messages ===');
  const messages = [
    {
      groupId,
      text: 'Hello world!',
      sender: 'user1',
      timestamp: Date.now()
    },
    {
      groupId,
      text: 'Second message',
      sender: 'user2',
      timestamp: Date.now() + 1000
    }
  ];

  try {
    const seqNums = await writeMessagesToStore(messages);
    console.log('✓ Messages written successfully');
    console.log('Sequence numbers:', seqNums, '\n');
  } catch (err) {
    console.error('✗ Failed to write messages:', err);
  }

  // Test 3: Read Messages
  console.log('=== Test 3: Read Messages ===');
  try {
    const readMessages = await readMessagesFromStore(groupId);
    console.log('✓ Messages read successfully');
    console.log('Messages:', readMessages);
    console.log('Message count:', readMessages.length, '\n');
  } catch (err) {
    console.error('✗ Failed to read messages:', err);
  }

  // Test 4: Get All Group Details
  console.log('=== Test 4: Get All Group Details ===');
  try {
    const allGroups = await getAllGroupDetails();
    console.log('✓ Retrieved all groups successfully');
    console.log('All groups:', allGroups);
    console.log('Group count:', allGroups.length, '\n');
  } catch (err) {
    console.error('✗ Failed to get group details:', err);
  }

  // Cleanup
  console.log('=== Cleanup ===');
  try {
    await cleanup();
    console.log('✓ Cleanup completed successfully\n');
  } catch (err) {
    console.error('✗ Cleanup failed:', err);
  }

  console.log('Tests completed');
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
});