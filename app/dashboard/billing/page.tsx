import BillingForm from '@/components/BillingForm';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export const dynamic = 'force-dynamic'; // Add this line

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    // Redirect to sign-in page or handle unauthenticated state
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-semibold text-xl">Please sign in to view your billing information.</h3>
        </div>
      </div>
    );
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;