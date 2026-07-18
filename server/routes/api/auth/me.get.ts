import { getAdminUser, toPublicUser } from '../../../utils/auth';

export default defineEventHandler(async event => {
    const user = await getAdminUser(event);
    return {
        user: user ? toPublicUser(user) : null,
    };
});
