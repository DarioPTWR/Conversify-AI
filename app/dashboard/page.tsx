export const dynamic = 'force-dynamic';

import Dashboard from '@/components/Dashboard';
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser(); // Await the getUser() function

  if (!user || !user.id) {
    redirect('/auth-callback?origin=dashboard');
    return null; // Prevent further execution
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    redirect('/auth-callback?origin=dashboard');
    return null; // Prevent further execution
  }

  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
