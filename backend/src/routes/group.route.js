// import express from 'express';
// import {
//   createGroup,
//   getGroups,
// } from '../controllers/group.controller.js';
// import {
//   getGroupMessages,
//   sendGroupMessage
// } from '../controllers/groupMessage.controller.js';
// import { protectRoute } from '../middleware/auth.middleware.js';

// const router = express.Router();

// router.post('/', protectRoute, createGroup); // Create a new group
// router.get('/', protectRoute, getGroups); // Fetch all groups for the logged-in user
// router.get('/:groupId/messages', protectRoute, getGroupMessages); // Fetch messages for a group
// router.post('/:groupId/messages', protectRoute, sendGroupMessage); // Send a new group message

// export default router;
import express from 'express';
import {
  createGroup,
  getGroups,
  updateGroupProfile,
  updateGroupMembers,
  deleteGroupChatForUser
} from '../controllers/group.controller.js';
import {
  getGroupMessages,
  sendGroupMessage
} from '../controllers/groupMessage.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createGroup); // Create a new group
router.get('/', protectRoute, getGroups); // Fetch all groups for the logged-in user
router.put('/:groupId', protectRoute, updateGroupProfile); // Update group profile
router.put('/:groupId/members', protectRoute, updateGroupMembers); // Update group members
router.delete('/:groupId/messages/:userId', protectRoute, deleteGroupChatForUser); // Delete group chat for a user
router.get('/:groupId/messages', protectRoute, getGroupMessages); // Fetch messages for a group
router.post('/:groupId/messages', protectRoute, sendGroupMessage); // Send a new group message

export default router;