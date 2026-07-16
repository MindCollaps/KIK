import { assertSameOrigin, destroyAdminSession } from '../../../utils/auth';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await destroyAdminSession(event);
    return { ok: true };
});