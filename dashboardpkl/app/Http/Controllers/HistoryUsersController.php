<?php

namespace App\Http\Controllers;

use App\Models\HistoryUsers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;


class HistoryUsersController extends Controller
{
    public function index()
    {
        return response()->json(HistoryUsers::with('user')->latest()->get());
    }

    public function show(HistoryUsers $historyUser)
    {
        return response()->json($historyUser->load('user'));
    }

    public function update(Request $request, HistoryUsers $historyUser)
    {
        $request->validate([
            'keterangan' => 'required|string',
        ]);

        $historyUser->update($request->only('keterangan'));

        return response()->json($historyUser);
    }

    public function destroy(HistoryUsers $historyUser)
    {
        $historyUser->delete();

        return response()->json(null, 204);
    }


    public static function record(string $keterangan)
    {
        $user = Auth::user();

        if ($user) {
            HistoryUsers::create([
                'id_user' => $user->id,
                'nama_user' => $user->name,
                'keterangan' => $keterangan,
                'tanggal' => Carbon::now()->toDateString(),
                'jam' => Carbon::now()->toTimeString(),
            ]);
        }
    }

    public function getHistoryByUser(string $id)
    {
        $history = HistoryUsers::where('id_user', $id)->latest()->get();
        return response()->json($history);
    }
}
