import { getAdminUser } from '../../../utils/auth';

export default defineEventHandler(async event => {
    const user = await getAdminUser(event);
    return {
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
    };
});