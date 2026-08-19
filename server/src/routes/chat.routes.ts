import { Router } from "express";
import * as chatController from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { uploadVoiceMessage } from "../middlewares/uploadVoice.middleware";
import { startConversationSchema, sendMessageSchema } from "../validators/chat.validators";
import { translateMessageSchema } from "../validators/translation.validators";

const router = Router();

router.use(authenticate);

router.post("/conversations", validate(startConversationSchema), chatController.startConversation);
router.get("/conversations", chatController.getMyConversations);
router.get("/conversations/:id/messages", validateObjectId("id"), chatController.getMessages);
router.post(
  "/conversations/:id/messages",
  validateObjectId("id"),
  validate(sendMessageSchema),
  chatController.sendMessage
);
router.post(
  "/conversations/:id/voice-messages",
  validateObjectId("id"),
  uploadVoiceMessage,
  chatController.sendVoiceMessage
);
router.patch("/conversations/:id/read", validateObjectId("id"), chatController.markRead);
router.post(
  "/messages/:messageId/translate",
  validateObjectId("messageId"),
  validate(translateMessageSchema),
  chatController.translateMessage
);

export default router;