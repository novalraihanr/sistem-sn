<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        try {
            $request->authenticate();

            return response()->json([
                'user' => Auth::user(),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Auth\AuthenticationException $e) {
            return response()->json([
                'message' => 'Authentication failed. Invalid credentials.',
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An unexpected error occurred during login.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        auth()->guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function register(Request $request)
    {
        try {
            // Authorization Check: Only admin can register new users if an admin is logged in
            if (Auth::check() && Auth::user()->role !== 'admin') {
                return response()->json([
                    'message' => 'Unauthorized. Only admin users can register new users.',
                ], 403); // 403 Forbidden
            }

            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'member', // Use provided role, default to 'member'
            ]);

            // Conditional login/response based on whether an admin is logged in
            if (!Auth::check()) { // If no user is currently authenticated (self-registration)
                Auth::login($user); // Log in the newly created user
                return response()->json([
                    'user' => Auth::user(), // Return the authenticated user
                ], 201);
            } else { // If an admin is authenticated
                return response()->json([
                    'message' => 'User registered successfully by admin.',
                    'user' => $user, // Return the newly created user (not the admin)
                ], 201);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An unexpected error occurred during registration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
