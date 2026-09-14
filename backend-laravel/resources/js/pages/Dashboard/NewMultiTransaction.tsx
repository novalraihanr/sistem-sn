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
import { PlusCircle, Trash2 } from 'lucide-react';

interface TransactionItem {
    part_id: string;
    quantity: number;
    harga_part: number;
    total_harga: number;
}

export default function NewMultiTransaction() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
    const [availableParts, setAvailableParts] = useState<any[]>([]);
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([
        { part_id: '', quantity: 1, harga_part: 0, total_harga: 0 }
    ]);
    const [overallTotal, setOverallTotal] = useState<number>(0);

    useEffect(() => {
        axios.get('/api/vendor').then((response) => {
            setVendors(response.data);
        });
    }, []);

    useEffect(() => {
        if (selectedVendorId) {
            axios.get(`/api/vendor/${selectedVendorId}/parts`).then((response) => {
                setAvailableParts(response.data);
                // Reset transaction items if vendor changes
                setTransactionItems([{ part_id: '', quantity: 1, harga_part: 0, total_harga: 0 }]);
            });
        }
    }, [selectedVendorId]);

    useEffect(() => {
        const total = transactionItems.reduce((sum, item) => sum + item.total_harga, 0);
        setOverallTotal(total);
    }, [transactionItems]);

    const handleVendorSelectChange = (value: string) => {
        setSelectedVendorId(value);
    };

    const handlePartSelectChange = (index: number, value: string) => {
        const updatedItems = [...transactionItems];
        const selectedPart = availableParts.find(part => part.id_part.toString() === value);

        if (selectedPart) {
            updatedItems[index].part_id = value;
            updatedItems[index].harga_part = selectedPart.pivot.harga_part;
            updatedItems[index].total_harga = selectedPart.pivot.harga_part * updatedItems[index].quantity;
        } else {
            updatedItems[index].part_id = '';
            updatedItems[index].harga_part = 0;
            updatedItems[index].total_harga = 0;
        }
        setTransactionItems(updatedItems);
    };

    const handleQuantityChange = (index: number, value: string) => {
        const updatedItems = [...transactionItems];
        const newQuantity = parseInt(value) || 0;
        updatedItems[index].quantity = newQuantity;
        updatedItems[index].total_harga = updatedItems[index].harga_part * newQuantity;
        setTransactionItems(updatedItems);
    };

    const handleAddTransactionItem = () => {
        setTransactionItems([...transactionItems, { part_id: '', quantity: 1, harga_part: 0, total_harga: 0 }]);
    };

    const handleRemoveTransactionItem = (index: number) => {
        const updatedItems = transactionItems.filter((_, i) => i !== index);
        setTransactionItems(updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendorId || transactionItems.length === 0) {
            alert('Please select a vendor and add at least one part.');
            return;
        }

        const payload = {
            vendor_id: selectedVendorId,
            items: transactionItems.map(item => ({
                part_id: item.part_id,
                jumlah: item.quantity,
                total_harga: item.total_harga,
            })),
            overall_total: overallTotal,
        };

        try {
            await axios.post('/api/transaksi-vendor/multi', payload);
            alert('Multi-part transaction created successfully!');
            router.visit('/dashboard/transactions'); // Redirect to transactions list
        } catch (error) {
            console.error('Error creating multi-part transaction:', error);
            alert('Failed to create multi-part transaction.');
        }
    };

    return (
        <AppLayout>
            <Head title="New Multi-Part Transaction" />
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">New Multi-Part Transaction</h1>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vendor_id" className="text-right">Vendor</Label>
                        <Select onValueChange={handleVendorSelectChange} value={selectedVendorId || ''}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.map((vendor: any) => (
                                    <SelectItem key={vendor.id_vendor} value={vendor.id_vendor.toString()}>
                                        {vendor.nama_vendor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <h2 className="text-xl font-semibold mt-4">Transaction Items</h2>
                    {transactionItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center border p-4 rounded-md">
                            <div className="col-span-2">
                                <Label htmlFor={`part_${index}`}>Part</Label>
                                <Select onValueChange={(value) => handlePartSelectChange(index, value)} value={item.part_id || ''} disabled={!selectedVendorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a part" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableParts.map((part: any) => (
                                            <SelectItem key={part.id_part} value={part.id_part.toString()}>
                                                {part.nama_part} (Price: {part.pivot.harga_part})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor={`quantity_${index}`}>Quantity</Label>
                                <Input
                                    id={`quantity_${index}`}
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor={`total_harga_${index}`}>Total Price</Label>
                                <Input
                                    id={`total_harga_${index}`}
                                    value={item.total_harga.toFixed(2)}
                                    readOnly
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveTransactionItem(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button type="button" onClick={handleAddTransactionItem} className="w-fit">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Part
                    </Button>

                    <div className="flex justify-end items-center mt-4">
                        <h3 className="text-xl font-bold mr-4">Overall Total:</h3>
                        <span className="text-2xl font-bold">{overallTotal.toFixed(2)}</span>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Create Multi-Part Transaction</Button>
                    </DialogFooter>
                </form>
            </div>
        </AppLayout>
    );
}