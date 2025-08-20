<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

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

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menambahkan unit baru: {$unit->nama_unit}");
        }

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
        $oldName = $unit->nama_unit;
        $unit->update($request->all());

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah mengupdate unit: {$oldName} menjadi {$unit->nama_unit}");
        }

        return response()->json($unit);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $unit = Unit::findOrFail($id);
        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menghapus unit: {$unit->nama_unit}");
        }
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