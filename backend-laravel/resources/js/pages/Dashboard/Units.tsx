import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Units() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUnit, setNewUnit] = useState({
        nama_unit: '',
    });
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const fetchUnits = () => {
        axios.get('/api/unit').then((response) => {
            setUnits(response.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editingUnit) {
            setEditingUnit({ ...editingUnit, [name]: value });
        } else {
            setNewUnit({ ...newUnit, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUnit) {
                await axios.put(`/api/unit/${editingUnit.id_unit}`, editingUnit);
                setEditingUnit(null);
                setIsEditDialogOpen(false);
            } else {
                await axios.post('/api/unit', newUnit);
                setNewUnit({ nama_unit: '' });
                setIsDialogOpen(false);
            }
            fetchUnits();
        } catch (error) {
            console.error('Error saving unit:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/unit/${id}`);
            fetchUnits();
        } catch (error) {
            console.error('Error deleting unit:', error);
        }
    };

    const handleEditClick = (unit: any) => {
        setEditingUnit(unit);
        setIsEditDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Units" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Units</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Unit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Unit</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nama_unit" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="nama_unit"
                                        name="nama_unit"
                                        value={newUnit.nama_unit}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
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
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((unit: any) => (
                                <TableRow key={unit.id_unit}>
                                    <TableCell>{unit.nama_unit}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(unit)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(unit.id_unit)}>Delete</Button>
                                        <Button variant="secondary" size="sm" className="ml-2" onClick={() => router.visit(`/dashboard/units/${unit.id_unit}/parts`)}>View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Unit</DialogTitle>
                        </DialogHeader>
                        {editingUnit && (
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_nama_unit" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="edit_nama_unit"
                                        name="nama_unit"
                                        value={editingUnit.nama_unit}
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
