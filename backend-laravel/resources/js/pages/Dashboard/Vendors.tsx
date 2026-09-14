import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

export default function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newVendor, setNewVendor] = useState({
        nama_vendor: '',
        alamat_vendor: '',
        kontak_vendor: '',
    });
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    

    const fetchVendors = () => {
        axios.get('/api/vendor').then((response) => {
            setVendors(response.data);
            setLoading(false);
        });
    };

    const fetchAllParts = () => {
        axios.get('/api/part').then((response) => {
            setAllParts(response.data);
        });
    };

    useEffect(() => {
        fetchVendors();
        fetchAllParts();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editingVendor) {
            setEditingVendor({ ...editingVendor, [name]: value });
        } else {
            setNewVendor({ ...newVendor, [name]: value });
        }
    };

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVendor) {
                await axios.put(`/api/vendor/${editingVendor.id_vendor}`, editingVendor);
                setEditingVendor(null);
                setIsEditDialogOpen(false);
            } else {
                await axios.post('/api/vendor', newVendor);
                setNewVendor({ nama_vendor: '', alamat_vendor: '', kontak_vendor: '' });
                setIsDialogOpen(false);
            }
            fetchVendors();
        } catch (error) {
            console.error('Error saving vendor:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/vendor/${id}`);
            fetchVendors();
        } catch (error) {
            console.error('Error deleting vendor:', error);
        }
    };

    const handleEditClick = (vendor: any) => {
        setEditingVendor(vendor);
        setIsEditDialogOpen(true);
    };

    

    return (
        <AppLayout>
            <Head title="Vendors" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Vendors</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Vendor</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Vendor</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nama_vendor" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="nama_vendor"
                                        name="nama_vendor"
                                        value={newVendor.nama_vendor}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="alamat_vendor" className="text-right">
                                        Address
                                    </Label>
                                    <Input
                                        id="alamat_vendor"
                                        name="alamat_vendor"
                                        value={newVendor.alamat_vendor}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="kontak_vendor" className="text-right">
                                        Contact
                                    </Label>
                                    <Input
                                        id="kontak_vendor"
                                        name="kontak_vendor"
                                        value={newVendor.kontak_vendor}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendors.map((vendor: any) => (
                                <TableRow key={vendor.id_vendor}>
                                    <TableCell>{vendor.nama_vendor}</TableCell>
                                    <TableCell>{vendor.alamat_vendor}</TableCell>
                                    <TableCell>{vendor.kontak_vendor}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(vendor)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(vendor.id_vendor)}>Delete</Button>
                                        <Button variant="secondary" size="sm" onClick={() => window.location.href = `/dashboard/vendors/${vendor.id_vendor}/parts`} className="ml-2">View Parts</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Vendor Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Vendor</DialogTitle>
                        </DialogHeader>
                        {editingVendor && (
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_nama_vendor" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="edit_nama_vendor"
                                        name="nama_vendor"
                                        value={editingVendor.nama_vendor}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_alamat_vendor" className="text-right">
                                        Address
                                    </Label>
                                    <Input
                                        id="edit_alamat_vendor"
                                        name="alamat_vendor"
                                        value={editingVendor.alamat_vendor}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_kontak_vendor" className="text-right">
                                        Contact
                                    </Label>
                                    <Input
                                        id="edit_kontak_vendor"
                                        name="kontak_vendor"
                                        value={editingVendor.kontak_vendor}
                                        onChange={handleInputChange}
                                        className="col-span-3"
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
