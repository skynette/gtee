import { useEffect, useState } from 'react';

import Image from 'next/image';

import { Connection, PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { SearchIcon, SparklesIcon, WalletIcon } from 'lucide-react';
import Moralis from 'moralis';

import BalanceCard from '@/components/balanceCard';
import BlurFade from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Skeleton } from '@/components/ui/skeleton';

import LineChart from './LineChart';
import PieChart from './PieChart';
import TradingAnalysis from './TradingAnalysis';
import TokensTable from './tokens/tokens-table';
import TransactionTable from './transactions/transaction-table';

const solConversionFactor = 1e9;

interface WalletSearchProps {
    initialAddress?: string;
}

const WalletSearch = ({ initialAddress = '' }: WalletSearchProps) => {
    const [address, setAddress] = useState<string>(initialAddress);
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [tokens, setTokens] = useState<any[]>([]);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [connection, setConnection] = useState<Connection | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // If initialAddress is provided, trigger the search automatically
        if (initialAddress) {
            fetchWalletData();
        }
    }, [initialAddress]); // Add initialAddress as dependency

    useEffect(() => {
        // Initialize the connection and Moralis API when the component mounts
        const initConnectionAndMoralis = () => {
            const conn = new Connection(
                'https://solana-mainnet.g.alchemy.com/v2/' +
                    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
            );
            setConnection(conn);

            Moralis.start({
                apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
            });
        };

        initConnectionAndMoralis();
    }, []);

    const fetchWalletData = async () => {
        if (!connection) return; // Ensure connection is available before fetching

        setLoading(true);
        setError(null);

        // Fetch portfolio data
        try {
            const response = await Moralis.SolApi.account.getSPL({
                network: 'mainnet',
                address,
            });

            const data = response.toJSON();
            setTokens(data);
        } catch (err) {
            setError('Invalid address or unable to fetch data.');
            console.error('Error in fetchWalletData:', err);
        }

        // Fetch transaction and balance history
        try {
            const publicKey = new PublicKey(address.trim());

            // Fetch SOL balance
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / solConversionFactor);

            // Fetch recent transaction signatures
            const signatures = await connection.getSignaturesForAddress(
                publicKey,
                {
                    limit: 30,
                },
            );

            const transactionDetailsPromises = signatures.map(
                async (signatureInfo) => {
                    const transaction = await connection.getTransaction(
                        signatureInfo.signature,
                        { maxSupportedTransactionVersion: 2 },
                    );
                    return transaction;
                },
            );

            const transactions = await Promise.all(transactionDetailsPromises);
            setTransactions(transactions);

            // Calculate historical balance based on transactions
            const historicalBalances = calculateHistoricalBalances(
                transactions,
                balance / solConversionFactor,
            );
            setHistoricalData(historicalBalances); // Set the historical data for chart
        } catch (err) {
            setError('Invalid address or unable to fetch data.');
            console.error('Error in fetchBalance:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to calculate historical balances
    const calculateHistoricalBalances = (
        transactions: any[],
        currentBalance: number,
    ) => {
        const balanceHistory: {
            time: string; // Convert blockTime to human-readable date
            balance: number;
        }[] = [];
        let runningBalance = currentBalance;

        // Sort transactions by block time
        const sortedTransactions = transactions
            .filter((tx) => tx !== null)
            .sort((a, b) => b.blockTime - a.blockTime); // Sort descending (newest to oldest)

        // Calculate balance changes
        sortedTransactions.forEach((transaction) => {
            const { meta, blockTime } = transaction;

            const preBalance = meta.preBalances[0] / solConversionFactor;
            const postBalance = meta.postBalances[0] / solConversionFactor;

            const balanceChange = postBalance - preBalance;

            // Save balance at each block time
            runningBalance -= balanceChange;
            balanceHistory.push({
                time: new Date(blockTime * 1000).toISOString(), // Convert blockTime to human-readable date
                balance: runningBalance,
            });
        });

        return balanceHistory.reverse(); // Return in chronological order
    };

    return (
        <div className="mx-auto my-8 w-11/12 md:w-10/12 lg:w-9/12 xl:w-2/3">
            <BlurFade delay={0.1}>
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}>
                    <motion.div
                        className="mx-auto flex max-w-xl flex-col gap-3"
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}>
                        <div className="mb-4 text-center">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm">
                                <SparklesIcon className="h-4 w-4 animate-pulse text-primary" />
                                <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-sm font-medium text-transparent">
                                    Analyze Another Wallet
                                </span>
                                <SparklesIcon className="h-4 w-4 animate-pulse text-primary" />
                            </motion.div>
                        </div>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter Solana wallet address"
                                    className="h-12 w-full rounded-lg border border-border bg-background/80 px-4 pr-12 text-sm backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <WalletIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary transition-colors" />
                            </div>
                            <RainbowButton
                                onClick={() => fetchWalletData()}
                                className="h-12 px-6 text-base transition-all duration-300 hover:scale-105">
                                <SearchIcon className="h-4 w-4" />
                            </RainbowButton>
                        </div>
                        {error && (
                            <p className="text-center text-sm text-red-500">
                                {error}
                            </p>
                        )}
                        {isHovered && (
                            <BorderBeam
                                size={300}
                                duration={10}
                                colorFrom="#4f46e5"
                                colorTo="#8b5cf6"
                                borderWidth={1.5}
                            />
                        )}
                    </motion.div>
                </motion.div>
            </BlurFade>

            {!loading && !error && balance == null && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-24 bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 bg-clip-text text-center text-2xl text-transparent">
                    Enter a wallet address to get started
                </motion.p>
            )}
            {error && !loading && balance == null && (
                <p className="mt-24 text-center text-2xl text-red-500">
                    {error}
                </p>
            )}
            {loading ? (
                <div className="mt-4">
                    <Skeleton className="h-[180px] w-[380px] rounded-lg"></Skeleton>
                    <div className="mt-12 flex w-full flex-col">
                        <Skeleton className="h-10 w-24 self-end"></Skeleton>
                        <Skeleton className="mt-2 h-10 w-full"></Skeleton>
                        <Skeleton className="mt-1 h-10 w-full"></Skeleton>
                        <Skeleton className="mt-1 h-10 w-full"></Skeleton>
                        <Skeleton className="mt-1 h-10 w-full"></Skeleton>
                    </div>
                </div>
            ) : (
                balance !== null &&
                tokens !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 w-full">
                        <div className="flex flex-col xl:flex-row xl:space-x-4">
                            <div className="sm:flex sm:space-x-4 xl:flex-col xl:space-x-0 xl:space-y-4">
                                <BalanceCard SOLBalance={balance} />
                                <PieChart tokens={tokens} />
                            </div>
                            {historicalData.length > 0 ? (
                                <Card className="mt-4 flex w-full flex-col xl:mt-0">
                                    <CardHeader>
                                        <CardTitle>Balance Over Time</CardTitle>
                                        <CardDescription>
                                            Balance of the wallet over time
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-full w-full">
                                        <LineChart data={historicalData} />
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle>Balance Over Time</CardTitle>
                                        <CardDescription>
                                            No historical data available
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex h-full w-full flex-col items-center">
                                        <Image
                                            src="/no-data-illustration.png"
                                            alt="No historical data available"
                                            width={450}
                                            height={450}
                                        />
                                        <p className="mt-4 text-sm text-muted">
                                            No historical data available for
                                            this wallet
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="mt-4">
                            <TransactionTable
                                transactions={transactions}
                                address={address}
                            />
                        </div>
                        <div className="mt-4">
                            {transactions.length > 0 && (
                                <TradingAnalysis
                                    transactions={transactions}
                                    address={address}
                                />
                            )}
                        </div>
                        <div className="mt-4 flex space-x-4">
                            {tokens.length > 0 && (
                                <TokensTable tokens={tokens} />
                            )}
                        </div>
                    </motion.div>
                )
            )}
        </div>
    );
};

export default WalletSearch;
