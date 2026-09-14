import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Parts() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPart, setNewPart] = useState({
        nama_part: '',
    });
    const [editingPart, setEditingPart] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const fetchParts = () => {
        axios.get('/api/part').then((response) => {
            setParts(response.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editingPart) {
            setEditingPart({ ...editingPart, [name]: value });
        } else {
            setNewPart({ ...newPart, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPart) {
                await axios.put(`/api/part/${editingPart.id_part}`, editingPart);
                setEditingPart(null);
                setIsEditDialogOpen(false);
            } else {
                await axios.post('/api/part', newPart);
                setNewPart({ nama_part: '' });
                setIsDialogOpen(false);
            }
            fetchParts();
        } catch (error) {
            console.error('Error saving part:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/part/${id}`);
            fetchParts();
        } catch (error) {
            console.error('Error deleting part:', error);
        }
    };

    const handleEditClick = (part: any) => {
        setEditingPart(part);
        setIsEditDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Parts" />
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Parts</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Part</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Part</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nama_part" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="nama_part"
                                        name="nama_part"
                                        value={newPart.nama_part}
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
                            {parts.map((part: any) => (
                                <TableRow key={part.id_part}>
                                    <TableCell>{part.nama_part}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(part)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(part.id_part)}>Delete</Button>
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
                            <DialogTitle>Edit Part</DialogTitle>
                        </DialogHeader>
                        {editingPart && (
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_nama_part" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="edit_nama_part"
                                        name="nama_part"
                                        value={editingPart.nama_part}
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
