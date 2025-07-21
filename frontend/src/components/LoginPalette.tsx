import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {CheckCircle, Lock, Mail} from 'lucide-react';
import { useLoginPalette } from '@/contexts/LoginPaletteContext';
import {useEffect, useState} from "react";


export const LoginPalette = () => {
    const { isOpen, closeLoginPalette, login, isLoggedIn, logout } = useLoginPalette();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
    };


    return (
        <Dialog open={isOpen} onOpenChange={closeLoginPalette}>
            <DialogContent className="max-w-sm">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Welcome 😁</h2>
                        <p className="text-muted-foreground">
                            {isLoggedIn ? 'You are logged in.' : 'Sign in to continue.'}
                        </p>
                    </div>

                    {!isLoggedIn ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="username"
                                        placeholder="JoeBidan"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                Sign In
                            </Button>
                        </form>

                    ) : (
                        <Button
                            onClick={logout}
                            variant="destructive"
                            className="w-full"
                        >
                            Sign Out
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>

    );
};
