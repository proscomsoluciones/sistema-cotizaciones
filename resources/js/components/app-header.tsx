import { Link, usePage } from '@inertiajs/react';
import { FileSignature, FileText, LayoutGrid, Menu, Moon, Package, Sun, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as clientesIndex } from '@/routes/clientes';
import { index as contratosIndex } from '@/routes/contratos';
import { index as cotizacionesIndex } from '@/routes/cotizaciones';
import { index as productosIndex } from '@/routes/productos';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

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

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    function toggleTheme() {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-card/90 backdrop-blur-md dark:border-slate-800/80">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Brand Logo & Mobile Trigger */}
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-1 lg:hidden text-slate-700 dark:text-slate-200"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-6">
                            <SheetHeader className="pb-6 border-b border-slate-100 dark:border-slate-800 text-left">
                                <SheetTitle className="flex items-center gap-2">
                                    <AppLogoIcon className="h-7 w-7" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">Proscom</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 flex flex-col gap-1.5">
                                {mainNavItems.map((item) => {
                                    const active = isCurrentUrl(item.href);

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                                                active
                                                    ? 'bg-[#0A2540] text-white font-semibold shadow-xs dark:bg-blue-600'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href={dashboard()} className="flex items-center gap-3 group">
                        <AppLogo />
                    </Link>
                </div>

                {/* Horizontal Navigation Links (Desktop) */}
                <div className="hidden lg:flex lg:items-center lg:gap-1">
                    <nav className="flex items-center gap-1.5">
                        {mainNavItems.map((item) => {
                            const active = isCurrentUrl(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all',
                                        active
                                            ? 'bg-[#0A2540] text-white font-semibold shadow-xs dark:bg-blue-600'
                                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')} />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Actions: Theme Toggle + User Profile */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        title={resolvedAppearance === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                        {resolvedAppearance === 'dark' ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-slate-600" />
                        )}
                        <span className="sr-only">Cambiar tema</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative flex items-center gap-2.5 rounded-full p-1 pl-3 pr-2 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <span className="hidden text-xs font-semibold md:inline-block max-w-[120px] truncate">
                                    {auth.user?.name}
                                </span>
                                <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-slate-200 shadow-2xs dark:border-slate-700">
                                    <AvatarImage
                                        src={auth.user?.avatar}
                                        alt={auth.user?.name}
                                    />
                                    <AvatarFallback className="bg-[#0A2540] font-bold text-white text-xs dark:bg-blue-600">
                                        {getInitials(auth.user?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-lg" align="end">
                            {auth.user && (
                                <UserMenuContent user={auth.user} />
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Breadcrumb sub-bar if needed */}
            {breadcrumbs.length > 1 && (
                <div className="border-t border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/40">
                    <div className="mx-auto flex h-10 w-full max-w-7xl items-center px-4 md:px-6 lg:px-8 text-xs text-slate-500">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </header>
    );
}
