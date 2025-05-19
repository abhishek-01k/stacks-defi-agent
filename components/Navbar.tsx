"use client";

import React from 'react';
import ThemeToggle from './ThemeToggle';
import ConnectWallet from './ConnectWallet';

const Navbar = () => {

    return (
        <div className='flex flex-row justify-end gap-4 px-8 py-4'>
            <ConnectWallet />
            <ThemeToggle />
        </div>
    );
};

export default Navbar;