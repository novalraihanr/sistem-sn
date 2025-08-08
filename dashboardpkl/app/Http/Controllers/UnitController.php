<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $unit = Unit::get();
        return response()->json($unit);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_part' => 'nullable|exists:part,id_part',
            'nama_unit' => 'required|string|max:255',
        ]);

        $unit = Unit::create($request->all());

        return response()->json($unit, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $unit = Unit::findOrFail($id);
        return response()->json($unit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'id_part' => 'nullable|exists:part,id_part',
            'nama_unit' => 'required|string|max:255',
        ]);

        $unit = Unit::findOrFail($id);
        $unit->update($request->all());

        return response()->json($unit);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $unit = Unit::findOrFail($id);
        $unit->delete();

        return response()->json(null, 204);
    }

    public function getUnitParts(int $unitId)
    {
        $unit = Unit::with(['parts' => function($query) {
            $query->withPivot('stok');
        }])->findOrFail($unitId);
        return response()->json($unit->parts);
    }
}
