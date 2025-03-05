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
  deleteGroupChatForUser,
  exitGroup,
  makeAdmin, // Import makeAdmin
  removeUser, // Import removeUser
} from '../controllers/group.controller.js';
import {
  getGroupMessages,
  sendGroupMessage
} from '../controllers/groupMessage.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createGroup);
router.get('/', protectRoute, getGroups);
router.put('/:groupId', protectRoute, updateGroupProfile);
router.put('/:groupId/members', protectRoute, updateGroupMembers);
router.post('/:groupId/delete', protectRoute, deleteGroupChatForUser);
router.post('/:groupId/exit', protectRoute, exitGroup);
router.post('/:groupId/make-admin/:userId', protectRoute, makeAdmin); // Add this route
router.post('/:groupId/remove-user/:userId', protectRoute, removeUser); // Add this route
router.get('/:groupId/messages', protectRoute, getGroupMessages);
router.post('/:groupId/messages', protectRoute, sendGroupMessage);

export default router;