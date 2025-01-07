// src/app/wallet/[address]/page.tsx
'use client';

import React from 'react';

import WalletSearch from '@/components/WalletSearch';

const SearchWalletsPage = () => {
    return (
        <div>
            <WalletSearch />
        </div>
    );
};

export default SearchWalletsPage;