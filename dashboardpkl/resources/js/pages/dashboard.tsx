import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h1>
                <p className="mb-6">Navigate to different sections of your application:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/dashboard/vendors" className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold">Vendors</h2>
                        <p className="text-sm text-gray-600">Manage your vendors.</p>
                    </Link>
                    <Link href="/dashboard/parts" className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold">Parts</h2>
                        <p className="text-sm text-gray-600">Manage your parts inventory.</p>
                    </Link>
                    <Link href="/dashboard/units" className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold">Units</h2>
                        <p className="text-sm text-gray-600">Manage your units.</p>
                    </Link>
                    <Link href="/dashboard/transactions" className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold">Transactions</h2>
                        <p className="text-sm text-gray-600">View and manage transactions.</p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
