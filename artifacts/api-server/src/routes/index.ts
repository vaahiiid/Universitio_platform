import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import askimateAuthRouter from "./askimate-auth";
import askimateChatRouter from "./askimate-chat";
import askimateStripeWebhookRouter from "./askimate-stripe-webhooks";
import leadsRouter from "./leads";
import publicRouter from "./public";
import adminRouter from "./admin";
import emailRouter from "./email";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
// Webhook MUST be registered before body parsing for signature verification
router.use(askimateStripeWebhookRouter);
router.use(askimateAuthRouter);
router.use(askimateChatRouter);
router.use(leadsRouter);
router.use(publicRouter);
router.use(adminRouter);
router.use(emailRouter);

export default router;
