import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-slate-50/90 p-6 md:p-10">
            {/* Soft Background Glow Accents */}
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-100/60 opacity-70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-slate-200/50 opacity-60 blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl backdrop-blur-xl transition-all">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium group"
                        >
                            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs transition-transform group-hover:scale-105">
                                <img src="/images/proscom-logo.png" alt="Proscom" className="h-9 w-auto object-contain" />
                            </div>
                            <span className="text-xs tracking-wider text-slate-500 font-normal">
                                Soluciones Tecnológicas a Medida
                            </span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-[#0A2540]">{title}</h1>
                            {description && (
                                <p className="text-center text-sm text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">{children}</div>

                    <div className="mt-8 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-6 text-xs text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-[#0A2540]" />
                        <span>Acceso Seguro · Proscom SpA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
