import React from 'react';
import { WalletButton } from "@/components/wallet/wallet-connect-button";
import Link from 'next/link';

const Navbar = () => {
    return (
        <div className='container px-4 py-6'>
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                    </Link>
                    <Link href="/">
                        <h1 className="text-2xl font-bold text-gradient cursor-pointer">SonicClout</h1>
                    </Link>
                </div>
                
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                        Home
                    </Link>
                    <Link href="/bonds" className="text-gray-300 hover:text-white transition-colors">
                        Bonds
                    </Link>
                    <Link href="/vesting" className="text-gray-300 hover:text-white transition-colors">
                        Vesting
                    </Link>
                </div>
                
                <WalletButton />
            </header>
        </div>
    );
};

export default Navbar;