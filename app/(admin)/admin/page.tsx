import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import {createClient} from "@/utils/supabase/server";

export default async function AdminPage() {

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // Get user data
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    // Check if user has admin role
    if (!user?.user_metadata?.role || user.user_metadata.role !== 'admin') {
        // Redirect non-admin users to home page
        redirect('/');
    }

    return <AdminDashboard user={user} />;
}