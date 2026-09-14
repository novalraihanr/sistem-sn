import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTransaction, setNewTransaction] = useState({
        jumlah: '',
        total_harga: '',
    });
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
    const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [partPrice, setPartPrice] = useState<number>(0);
    const [vendors, setVendors] = useState<any[]>([]);
    const [availableParts, setAvailableParts] = useState<any[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // New state for month filter

    const fetchTransactions = (month: string | null = null) => {
        let url = '/api/transaksi';
        if (month) {
            url += `?month=${month}`;
        }
        axios.get(url).then((response) => {
            setTransactions(response.data);
            setLoading(false);
        });
    };

    const fetchVendors = () => {
        axios.get('/api/vendor').then((response) => {
            setVendors(response.data);
        });
    };

    const fetchPartsForVendor = (vendorId: string) => {
        axios.get(`/api/vendor/${vendorId}/parts`).then((response) => {
            setAvailableParts(response.data);
            setSelectedPartId(null); // Reset part selection
            setPartPrice(0); // Reset part price
        });
    };

    useEffect(() => {
        fetchTransactions(selectedMonth);
        fetchVendors();
    }, [selectedMonth]);

    useEffect(() => {
        if (selectedVendorId) {
            fetchPartsForVendor(selectedVendorId);
        }
    }, [selectedVendorId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editingTransaction) {
            setEditingTransaction({ ...editingTransaction, [name]: value });
        } else if (name === 'jumlah') {
            setQuantity(parseInt(value));
            setNewTransaction({ ...newTransaction, jumlah: value, total_harga: (partPrice * parseInt(value)).toString() });
        } else {
            setNewTransaction({ ...newTransaction, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await axios.put(`/api/transaksi-vendor/${editingTransaction.id_transaksivendor}`, editingTransaction);
                setEditingTransaction(null);
                setIsEditDialogOpen(false);
            } else {
                await axios.post('/api/transaksi-vendor', {
                    vendor_id: selectedVendorId,
                    part_id: selectedPartId,
                    jumlah: quantity,
                    total_harga: newTransaction.total_harga,
                });
                setNewTransaction({ jumlah: '', total_harga: '' });
                setSelectedVendorId(null);
                setSelectedPartId(null);
                setQuantity(1);
                setPartPrice(0);
                setIsDialogOpen(false);
            }
            fetchTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/transaksi/${id}`);
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    

    return (
        <AppLayout>
            <Head title="Transactions" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <div className="flex space-x-2">
                        <Button onClick={() => router.visit('/dashboard/transactions/new-multi')}>Add Multi-Part Transaction</Button>
                    </div>
                </div>
                <div className="mb-4 flex items-center space-x-2">
                    <Label htmlFor="month-filter">Filter by Month:</Label>
                    <Select onValueChange={(value) => setSelectedMonth(value)} value={selectedMonth || ''}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            <SelectItem value="01">January</SelectItem>
                            <SelectItem value="02">February</SelectItem>
                            <SelectItem value="03">March</SelectItem>
                            <SelectItem value="04">April</SelectItem>
                            <SelectItem value="05">May</SelectItem>
                            <SelectItem value="06">June</SelectItem>
                            <SelectItem value="07">July</SelectItem>
                            <SelectItem value="08">August</SelectItem>
                            <SelectItem value="09">September</SelectItem>
                            <SelectItem value="10">October</SelectItem>
                            <SelectItem value="11">November</SelectItem>
                            <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor Name</TableHead>
                                <TableHead>Total Price</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction: any) => {
                                const displayVendor = transaction.transaksivendor.length > 0 ? transaction.transaksivendor[0].vendor_part.vendor.nama_vendor : 'N/A';

                                return (
                                    <TableRow key={transaction.id_transaksi}>
                                        <TableCell>{displayVendor}</TableCell>
                                        <TableCell>{transaction.total}</TableCell>
                                        <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction.id_transaksi)}>Delete</Button>
                                            <Button variant="secondary" size="sm" className="ml-2" onClick={() => router.visit(`/dashboard/transactions/${transaction.id_transaksi}`)}>View Details</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                                        

                
            </div>
        </AppLayout>
    );
}
