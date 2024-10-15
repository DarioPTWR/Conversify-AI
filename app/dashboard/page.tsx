import Dashboard from '@/components/Dashboard'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'; // Force dynamic rendering

const Page = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser() // Await the getUser() function

  if (!user || !user.id) {
    redirect('/auth-callback?origin=dashboard')
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  })

  if (!dbUser) {
    redirect('/auth-callback?origin=dashboard')
  }
  
  return <Dashboard />
}

export default Page
