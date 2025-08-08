import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TransactionDetails() {
    const { props } = usePage();
    const { transaction } = props as any;

    if (!transaction) {
        return (
            <AppLayout>
                <Head title="Transaction Details" />
                <div className="container mx-auto py-10">
                    <h1 className="text-2xl font-bold">Transaction not found.</h1>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Transaction ${transaction.id_transaksi} Details`} />
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">Transaction Details (ID: {transaction.id_transaksi})</h1>
                <div className="mb-4">
                    <p><strong>Overall Total:</strong> {transaction.total}</p>
                    <p><strong>Timestamp:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
                </div>

                <h2 className="text-xl font-semibold mb-3">Items:</h2>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor Name</TableHead>
                                <TableHead>Part Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Item Total Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transaction.transaksivendor.map((item: any) => (
                                <TableRow key={item.id_transaksivendor}>
                                    <TableCell>{item.vendor_part.vendor.nama_vendor}</TableCell>
                                    <TableCell>{item.vendor_part.part.nama_part}</TableCell>
                                    <TableCell>{item.jumlah}</TableCell>
                                    <TableCell>{item.total_harga}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}