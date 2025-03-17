"use client";

import React, { ReactNode } from 'react';
import { Orbis, OrbisProvider } from "@orbisclub/components";
import "@orbisclub/components/dist/index.modern.css";
import GlobalContextProvider from '@/context/GlobalContext';

const Providers = ({ children }: { children: ReactNode }) => {

    let orbis = new Orbis({
        useLit: false,
        node: "https://node2.orbis.club",
    });

    return (
        <OrbisProvider defaultOrbis={orbis}>
            <GlobalContextProvider>
                {children}
            </GlobalContextProvider>
        </OrbisProvider>
    );
};

export default Providers;