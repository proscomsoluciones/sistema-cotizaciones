import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props;

    return (
        <div className={`flex items-center justify-center rounded-lg bg-white p-1 shadow-xs dark:bg-white/90 ${className ?? ''}`} {...rest}>
            <img src="/images/proscom-icon.png" alt="Proscom Icon" className="h-6 w-6 object-contain" />
        </div>
    );
}
