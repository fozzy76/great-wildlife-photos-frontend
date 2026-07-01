import { Router } from 'express';
import healthCheck from './health-check.js';
import stripeRouter from './stripe.js';
import merchoneRouter from './merchone.js';
import authRouter from './auth.js';
import ordersRouter from './orders.js';
import ordersAdminRouter from './orders-admin.js';
import adminRouter from './admin.js';
import migrateRouter from './migrate.js';
import photosRouter from './photos.js';
import checkoutRouter from './checkout.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/stripe', stripeRouter);
    router.use('/merchone', merchoneRouter);
    router.use('/auth', authRouter);
    router.use('/orders', ordersRouter);
    router.use('/orders-admin', ordersAdminRouter);
    router.use('/admin', adminRouter);
    router.use('/migrate', migrateRouter);
    router.use('/photos', photosRouter);
    router.use('/checkout', checkoutRouter);

    return router;
};