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

export default function UnitPartsPage() {
    const { props } = usePage();
    const { unit } = props as any;

    const [unitParts, setUnitParts] = useState([]);
    const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
    const [isEditPartDialogOpen, setIsEditPartDialogOpen] = useState(false);
    const [allParts, setAllParts] = useState([]);
    const [newUnitPart, setNewUnitPart] = useState({
        part_id: '',
        stok: '',
    });
    const [editingUnitPart, setEditingUnitPart] = useState<any>(null);

    const fetchUnitParts = () => {
        if (unit) {
            axios.get(`/api/unit/${unit.id_unit}/parts`).then((response) => {
                setUnitParts(response.data);
            });
        }
    };

    const fetchAllParts = () => {
        axios.get('/api/part').then((response) => {
            setAllParts(response.data);
        });
    };

    useEffect(() => {
        fetchUnitParts();
        fetchAllParts();
    }, [unit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'stok') {
            const parsedValue = parseInt(value);
            const numericValue = isNaN(parsedValue) ? '' : parsedValue.toString();
            if (editingUnitPart) {
                setEditingUnitPart({ ...editingUnitPart, [name]: numericValue });
            } else {
                setNewUnitPart({ ...newUnitPart, [name]: numericValue });
            }
        } else {
            if (editingUnitPart) {
                setEditingUnitPart({ ...editingUnitPart, [name]: value });
            } else {
                setNewUnitPart({ ...newUnitPart, [name]: value });
            }
        }
    };

    const handlePartSelectChange = (value: string) => {
        setNewUnitPart({ ...newUnitPart, part_id: value });
    };

    const handleAddUnitPartSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit) return;
        try {
            await axios.post('/api/unit-part', {
                unit_id: unit.id_unit,
                part_id: newUnitPart.part_id,
                stok: parseInt(newUnitPart.stok),
            });
            setNewUnitPart({ part_id: '', stok: '' });
            setIsAddPartDialogOpen(false);
            fetchUnitParts(); // Refresh parts list
        } catch (error) {
            console.error('Error adding unit part:', error);
        }
    };

    const handleEditUnitPartClick = (part: any) => {
        setEditingUnitPart(part.pivot);
        setIsEditPartDialogOpen(true);
    };

    const handleUpdateUnitPartSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit || !editingUnitPart) return;
        try {
            await axios.put(`/api/unit-part/${unit.id_unit}/${editingUnitPart.id_part}`, {
                stok: parseInt(editingUnitPart.stok),
            });
            setEditingUnitPart(null);
            setIsEditPartDialogOpen(false);
            fetchUnitParts(); // Refresh parts list
        } catch (error) {
            console.error('Error updating unit part:', error);
        }
    };

    const handleDeleteUnitPart = async (partId: number) => {
        if (!unit) return;
        try {
            await axios.delete(`/api/unit-part/${unit.id_unit}/${partId}`);
            fetchUnitParts(); // Refresh parts list
        } catch (error) {
            console.error('Error deleting unit part:', error);
        }
    };

    if (!unit) {
        return (
            <AppLayout>
                <Head title="Unit Parts" />
                <div className="container mx-auto py-10">
                    <h1 className="text-2xl font-bold">Unit not found.</h1>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Parts for ${unit.nama_unit}`} />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Parts for {unit.nama_unit}</h1>
                    <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Part to Unit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Part to {unit.nama_unit}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddUnitPartSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="part_id" className="text-right">Part</Label>
                                    <Select onValueChange={handlePartSelectChange} value={newUnitPart.part_id} required>
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
                                    <Label htmlFor="stok" className="text-right">Stock</Label>
                                    <Input
                                        id="stok"
                                        name="stok"
                                        type="number"
                                        value={newUnitPart.stok}
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
                                <TableHead>Stock</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unitParts.map((part: any) => (
                                <TableRow key={part.id_part}>
                                    <TableCell>{part.nama_part}</TableCell>
                                    <TableCell>{part.pivot.stok}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditUnitPartClick(part)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUnitPart(part.id_part)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Unit Part Dialog */}
                <Dialog open={isEditPartDialogOpen} onOpenChange={setIsEditPartDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Part for {unit.nama_unit}</DialogTitle>
                        </DialogHeader>
                        {editingUnitPart && (
                            <form onSubmit={handleUpdateUnitPartSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_stok" className="text-right">Stock</Label>
                                    <Input
                                        id="edit_stok"
                                        name="stok"
                                        type="number"
                                        value={editingUnitPart.stok}
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