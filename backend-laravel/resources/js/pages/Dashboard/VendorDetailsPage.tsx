import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

export default function VendorDetailsPage() {
    const { props } = usePage();
    const { vendor } = props as any;

    const [vendorParts, setVendorParts] = useState([]);
    const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
    const [isEditPartDialogOpen, setIsEditPartDialogOpen] = useState(false);
    const [allParts, setAllParts] = useState([]);
    const [newVendorPart, setNewVendorPart] = useState({
        part_id: '',
        harga_part: '',
        merk_part: '',
    });
    const [editingVendorPart, setEditingVendorPart] = useState<any>(null);

    const fetchVendorParts = async () => {
        try {
            const response = await axios.get(`/api/vendor/${vendor.id_vendor}/parts`);
            setVendorParts(response.data);
        } catch (error) {
            console.error('Error fetching vendor parts:', error);
        }
    };

    const fetchAllParts = () => {
        axios.get('/api/part').then((response) => {
            setAllParts(response.data);
        });
    };

    useEffect(() => {
        if (vendor) {
            fetchVendorParts();
            fetchAllParts();
        }
    }, [vendor]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editingVendorPart) {
            setEditingVendorPart({ ...editingVendorPart, [name]: value });
        } else {
            setNewVendorPart({ ...newVendorPart, [name]: value });
        }
    };

    const handlePartSelectChange = (value: string) => {
        setNewVendorPart({ ...newVendorPart, part_id: value });
    };

    const handleAddVendorPartSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor) return;
        try {
            await axios.post('/api/vendor-part', {
                vendor_id: vendor.id_vendor,
                part_id: newVendorPart.part_id,
                harga_part: parseFloat(newVendorPart.harga_part),
                merk_part: newVendorPart.merk_part,
            });
            setNewVendorPart({ part_id: '', harga_part: '', merk_part: '' });
            setIsAddPartDialogOpen(false);
            fetchVendorParts(); // Refresh parts list
        } catch (error) {
            console.error('Error adding vendor part:', error);
        }
    };

    const handleEditVendorPartClick = (part: any) => {
        setEditingVendorPart({ ...part.pivot, part_id: part.id_part });
        setIsEditPartDialogOpen(true);
    };

    const handleUpdateVendorPartSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !editingVendorPart) return;
        try {
            await axios.put(`/api/vendor-part/${vendor.id_vendor}/${parseInt(editingVendorPart.part_id)}`, {
                harga_part: parseFloat(editingVendorPart.harga_part),
                merk_part: editingVendorPart.merk_part,
            });
            setEditingVendorPart(null);
            setIsEditPartDialogOpen(false);
            fetchVendorParts(); // Refresh parts list
        } catch (error) {
            console.error('Error updating vendor part:', error);
        }
    };

    const handleDeleteVendorPart = async (partId: number) => {
        if (!vendor) return;
        try {
            await axios.delete(`/api/vendor-part/${vendor.id_vendor}/${partId}`);
            fetchVendorParts(); // Refresh parts list
        } catch (error) {
            console.error('Error deleting vendor part:', error);
        }
    };

    if (!vendor) {
        return (
            <AppLayout>
                <Head title="Vendor Details" />
                <div className="container mx-auto py-10">
                    <h1 className="text-2xl font-bold">Vendor not found.</h1>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Details for ${vendor.nama_vendor}`} />
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">Vendor Details: {vendor.nama_vendor}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Vendor Information</h2>
                        <p><strong>Name:</strong> {vendor.nama_vendor}</p>
                        <p><strong>Address:</strong> {vendor.alamat_vendor}</p>
                        <p><strong>Contact:</strong> {vendor.kontak_vendor}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Parts from {vendor.nama_vendor}</h2>
                    <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Part to Vendor</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Part to {vendor.nama_vendor}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddVendorPartSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="part_id" className="text-right">Part</Label>
                                    <Select onValueChange={handlePartSelectChange} value={newVendorPart.part_id} required>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a part" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allParts.map((part: any) => (
                                                <SelectItem key={part.id_part} value={part.id_part.toString()}>
                                                    {part.nama_part}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="harga_part" className="text-right">Price</Label>
                                    <Input
                                        id="harga_part"
                                        name="harga_part"
                                        type="number"
                                        value={newVendorPart.harga_part}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="merk_part" className="text-right">Brand</Label>
                                    <Input
                                        id="merk_part"
                                        name="merk_part"
                                        value={newVendorPart.merk_part}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Add Part</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Part Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendorParts.map((part: any) => {
                                const priceChange = part.pivot.harga_part - part.pivot.harga_sebelumnya_part;
                                const isIncreased = priceChange > 0;
                                const isDecreased = priceChange < 0;
                                const displayChange = Math.abs(priceChange).toFixed(2);

                                return (
                                    <TableRow key={part.id_part}>
                                        <TableCell>{part.nama_part}</TableCell>
                                        <TableCell>{part.pivot.merk_part}</TableCell>
                                        <TableCell className="flex items-center">
                                            {part.pivot.harga_part}
                                            {priceChange !== 0 && (
                                                <span className={`ml-2 flex items-center text-xs ${isDecreased ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isDecreased ? <ArrowDownIcon className="h-3 w-3 mr-0.5" /> : <ArrowUpIcon className="h-3 w-3 mr-0.5" />}
                                                    {displayChange}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditVendorPartClick(part)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteVendorPart(part.id_part)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Vendor Part Dialog */}
                <Dialog open={isEditPartDialogOpen} onOpenChange={setIsEditPartDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Part for {vendor.nama_vendor}</DialogTitle>
                        </DialogHeader>
                        {editingVendorPart && (
                            <form onSubmit={handleUpdateVendorPartSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_harga_part" className="text-right">Price</Label>
                                    <Input
                                        id="edit_harga_part"
                                        name="harga_part"
                                        type="number"
                                        value={editingVendorPart.harga_part}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_merk_part" className="text-right">Brand</Label>
                                    <Input
                                        id="edit_merk_part"
                                        name="merk_part"
                                        value={editingVendorPart.merk_part}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}