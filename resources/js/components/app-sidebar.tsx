import { Link } from '@inertiajs/react';
import { BookOpen, FileSignature, FileText, FolderGit2, LayoutGrid, Package, Receipt, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as clientesIndex } from '@/routes/clientes';
import { index as contratosIndex } from '@/routes/contratos';
import { index as cotizacionesIndex } from '@/routes/cotizaciones';
import { index as pagosIndex } from '@/routes/pagos';
import { index as productosIndex } from '@/routes/productos';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Cotizaciones',
        href: cotizacionesIndex(),
        icon: FileText,
    },
    {
        title: 'Contratos',
        href: contratosIndex(),
        icon: FileSignature,
    },
    {
        title: 'Pagos',
        href: pagosIndex(),
        icon: Receipt,
    },
    {
        title: 'Clientes',
        href: clientesIndex(),
        icon: Users,
    },
    {
        title: 'Productos',
        href: productosIndex(),
        icon: Package,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
