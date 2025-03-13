declare module '@orbisclub/components' {
    import React from 'react';

    export interface OrbisContextType {
        orbis: any;
        user: any;
        connecting: boolean;
        setConnectModalVis: (visible: boolean) => void;
        setUser: (user: any) => void;
    }

    export function useOrbis(): OrbisContextType;

    export class Orbis {
        constructor(options: { useLit?: boolean; node?: string });
        getPosts(options: { context: string }): Promise<{ data: any[]; error: any }>;
        createPost(options: { context?: string; title?: string; body: string; reply_to?: string }): Promise<{ status: number }>;
        logout(): Promise<{ status: number }>;
    }

    export interface OrbisProviderProps {
        defaultOrbis: Orbis;
        children: React.ReactNode;
    }

    export function OrbisProvider(props: OrbisProviderProps): JSX.Element;
} 