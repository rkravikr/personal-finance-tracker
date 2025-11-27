import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/ProfileForm';
import { SecuritySettings } from '@/components/SecuritySettings';

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/login');
    }

    const user = db.getUserByEmail(session.user.email!);

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                    <ProfileForm user={user} />
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                    <SecuritySettings user={user} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
