import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function BestPartPrices() {
    const [bestPrices, setBestPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartFilter, setSelectedPartFilter] = useState<string | null>(null);
    const [allParts, setAllParts] = useState([]);
    const [vendorsForSelectedPart, setVendorsForSelectedPart] = useState([]);

    useEffect(() => {
        axios.get('/api/part').then((response) => {
            setAllParts(response.data);
        });
    }, []);

    useEffect(() => {
        if (selectedPartFilter === 'all' || selectedPartFilter === null) {
            axios.get('/api/part/best-prices').then((response) => {
                setBestPrices(response.data);
                setLoading(false);
            });
        } else {
            axios.get(`/api/part/${selectedPartFilter}/vendors`).then((response) => {
                setVendorsForSelectedPart(response.data);
                setLoading(false);
            });
        }
    }, [selectedPartFilter]);

    if (loading) {
        return (
            <AppLayout>
                <Head title="Best Part Prices" />
                <div className="container mx-auto py-10">
                    <h1 className="text-2xl font-bold">Loading Best Part Prices...</h1>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Best Part Prices" />
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">Best Part Prices</h1>
                <div className="mb-4 flex items-center space-x-2">
                    <Label htmlFor="part-filter">Filter by Part:</Label>
                    <Select onValueChange={(value) => setSelectedPartFilter(value)} value={selectedPartFilter || ''}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a part" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Parts</SelectItem>
                            {allParts.map((part: any) => (
                                <SelectItem key={part.id_part} value={part.id_part.toString()}>
                                    {part.nama_part}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Part Name</TableHead>
                                <TableHead>Vendor Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(selectedPartFilter === 'all' || selectedPartFilter === null)
                                ? bestPrices.map((item: any) => (
                                    <TableRow key={item.part_id + '-' + item.vendor_id}>
                                        <TableCell>{item.part_name}</TableCell>
                                        <TableCell>{item.vendor_name}</TableCell>
                                        <TableCell>{item.harga_part}</TableCell>
                                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="secondary" size="sm" onClick={() => router.visit(`/dashboard/vendors/${item.vendor_id}`)}>View Vendor</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                                : vendorsForSelectedPart.map((item: any) => (
                                    <TableRow key={item.id_vendor}>
                                        <TableCell>{allParts.find((p: any) => p.id_part.toString() === selectedPartFilter)?.nama_part}</TableCell>
                                        <TableCell>{item.nama_vendor}</TableCell>
                                        <TableCell>{item.pivot.harga_part}</TableCell>
                                        <TableCell>{new Date(item.pivot.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="secondary" size="sm" onClick={() => router.visit(`/dashboard/vendors/${item.id_vendor}`)}>View Vendor</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}