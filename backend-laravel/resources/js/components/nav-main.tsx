import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

const dashboardNavItems: NavItem[] = [
    {
        title: 'Vendors',
        href: '/dashboard/vendors',
    },
    {
        title: 'Parts',
        href: '/dashboard/parts',
    },
    {
        title: 'Units',
        href: '/dashboard/units',
    },
    {
        title: 'Transactions',
        href: '/dashboard/transactions',
    },
    {
        title: 'Best Part Prices',
        href: '/dashboard/best-part-prices',
    },
];

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const allItems = [...items, ...dashboardNavItems];

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {allItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
