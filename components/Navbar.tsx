import React from 'react';
import { WalletButton } from "@/components/wallet/wallet-connect-button";

const Navbar = () => {
    return (
        <div className='container px-4 py-6'>
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gradient">SonicClout</h1>
                </div>
                <WalletButton />
            </header>
        </div>
    );
};

export default Navbar;