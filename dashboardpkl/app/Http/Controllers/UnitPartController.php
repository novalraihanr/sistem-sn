<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnitPartController extends Controller
{
    public function getUnitParts(int $id)
    {
        $unit = Unit::findOrFail($id);
        $parts = $unit->parts;

        return response()->json($parts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|integer|exists:unit,id_unit',
            'part_id' => 'required|integer|exists:part,id_part',
            'stok' => 'required|integer|min:0',
        ]);

        try {
            $unit = Unit::findOrFail($validated['unit_id']);
            $unit->parts()->attach($validated['part_id'], ['stok' => $validated['stok']]);

            return response()->json(['message' => 'Part added to unit successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error adding part to unit.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $unitId, int $partId)
    {
        $validated = $request->validate([
            'stok' => 'required|integer|min:0',
        ]);

        try {
            $unit = Unit::findOrFail($unitId);
            $unit->parts()->updateExistingPivot($partId, ['stok' => $validated['stok']]);

            return response()->json(['message' => 'Stok updated successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating stok.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $unitId, int $partId)
    {
        try {
            $unit = Unit::findOrFail($unitId);
            $unit->parts()->detach($partId);

            return response()->json(['message' => 'Part removed from unit successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error removing part from unit.', 'error' => $e->getMessage()], 500);
        }
    }

    public function checkStokWarning()
    {
        $allWarnings = [];
        $units = Unit::with('parts')->get(); // Eager load parts to avoid N+1 query problem

        foreach ($units as $unit) {
            foreach ($unit->parts as $part) {
                if ($part->pivot->stok < 3) {
                    $allWarnings[] = [
                        'unit_name' => $unit->nama_unit,
                        'part_name' => $part->nama_part,
                        'stok' => $part->pivot->stok,
                        'warning' => 'Stok is less than 3.',
                        'status' => 'warning'
                    ];
                }
            }
        }

        return response()->json(['warnings' => $allWarnings]);
    }
}
