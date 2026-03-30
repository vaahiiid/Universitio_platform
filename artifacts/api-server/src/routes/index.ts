import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import askimateAuthRouter from "./askimate-auth";
import askimateChatRouter from "./askimate-chat";
import leadsRouter from "./leads";
import publicRouter from "./public";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(askimateAuthRouter);
router.use(askimateChatRouter);
router.use(leadsRouter);
router.use(publicRouter);
router.use(adminRouter);

export default router;
