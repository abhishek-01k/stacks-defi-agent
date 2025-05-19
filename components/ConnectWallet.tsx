"use client";

import { useEffect, useState } from 'react';
import { connect, disconnect, isConnected } from '@stacks/connect';
import { getLocalStorage } from '@stacks/connect';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from 'lucide-react';

interface StacksAddress {
    address: string;
    purpose: string;
    addressType: string;
    walletType: string;
}

interface Addresses {
    stx: StacksAddress[];
    btc: StacksAddress[];
}

interface StorageData {
    addresses: Addresses;
    version: string;
    updatedAt: number;
}

export default function ConnectWallet() {
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            const connected = await isConnected();
            setIsWalletConnected(connected);

            if (connected) {
                const data = getLocalStorage() as StorageData;
                if (data?.addresses?.stx?.[0]?.address) {
                    setAddress(data.addresses.stx[0].address);
                }
            }
        };

        checkConnection();
    }, []);

    const handleConnect = async () => {
        try {
            const response = await connect();
            if (response) {
                setIsWalletConnected(true);
                const data = getLocalStorage() as StorageData;
                if (data?.addresses?.stx?.[0]?.address) {
                    setAddress(data.addresses.stx[0].address);
                }
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            setIsWalletConnected(false);
            setAddress(null);
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    };

    if (!isWalletConnected) {
        return (
            <Button onClick={handleConnect} variant="default">
                Connect Wallet
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-mono">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
