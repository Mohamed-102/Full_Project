<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class Cors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Handle preflight requests
        if ($request->getMethod() === "OPTIONS") {
            return response()
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization, Accept')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->setStatusCode(200);
        }
        
        $response = $next($request);
        
        // Skip CORS headers for file downloads - they handle their own headers
        if ($response instanceof BinaryFileResponse) {
            return $response;
        }
        
        // For normal responses, apply CORS headers
        $response->header('Access-Control-Allow-Origin', 'http://localhost:3000');
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization, Accept');
        $response->header('Access-Control-Allow-Credentials', 'true');
        
        return $response;
    }
}

