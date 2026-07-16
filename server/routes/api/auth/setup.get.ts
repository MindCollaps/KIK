import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async () => {
    const initialized = await prisma.setupState.findUnique({
        where: { key: 'admin_initialized' },
        select: { key: true },
    });

    return { registrationOpen: !initialized };
});