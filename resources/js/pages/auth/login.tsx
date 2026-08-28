import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Iniciar sesión" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-slate-700 text-sm font-semibold">Correo electrónico</Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="tu@empresa.com"
                                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0A2540]"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700 text-sm font-semibold">Contraseña</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0A2540]"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-slate-300 data-[state=checked]:bg-[#0A2540] data-[state=checked]:border-[#0A2540]"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal text-slate-600 cursor-pointer">
                                    Recordarme en este dispositivo
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-3 w-full bg-[#0A2540] hover:bg-[#103459] text-white font-semibold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2 text-white" />}
                                Iniciar sesión
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Acceso al sistema',
    description: 'Ingresa tus credenciales corporativas para ingresar',
};
