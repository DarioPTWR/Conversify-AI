import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const handler = (req: Request) => {
  const { getUser } = getKindeServerSession();
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const user = await getUser();

      return {
        userId: user?.id || null,
        user: user || null,
      };
    },
  });
};

export { handler as GET, handler as POST };