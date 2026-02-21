import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const startTime = Date.now();

// Simple response cache
let cachedResponse: { data: unknown; cachedAt: number } | null = null;
const CACHE_TTL_MS = 10_000; // 10 seconds

/**
 * GET /api/health
 *
 * Returns the overall health status of the platform including:
 * - Database connectivity and latency
 * - Application version
 * - Uptime in seconds
 *
 * No authentication required.
 * Responses are cached for 10 seconds to avoid hammering the DB.
 */
export async function GET() {
  try {
    const now = Date.now();

    // Return cached response if still fresh
    if (cachedResponse && now - cachedResponse.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json(cachedResponse.data, {
        headers: {
          "Cache-Control": "public, max-age=10",
          "X-Cache": "HIT",
        },
      });
    }

    // ── Database health check ────────────────────────────────────
    let dbStatus: "healthy" | "unhealthy" = "unhealthy";
    let dbLatencyMs = -1;

    try {
      const dbStart = Date.now();
      // Simple query to verify connectivity
      await prisma.$queryRawUnsafe("SELECT 1");
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = "healthy";
    } catch (dbError) {
      console.error("[Health] Database check failed:", dbError);
      dbStatus = "unhealthy";
    }

    // ── Determine overall status ─────────────────────────────────
    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (dbStatus === "healthy") {
      overallStatus = dbLatencyMs > 1000 ? "degraded" : "healthy";
    } else {
      overallStatus = "unhealthy";
    }

    const uptimeSeconds = Math.floor((now - startTime) / 1000);

    const responseData = {
      success: true,
      data: {
        status: overallStatus,
        version: process.env.npm_package_version || "0.1.0",
        timestamp: new Date().toISOString(),
        uptime: uptimeSeconds,
        checks: {
          database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
          },
          cache: {
            status: "healthy" as const,
            hitRate: cachedResponse ? 1.0 : 0.0,
          },
        },
      },
    };

    // Cache the response
    cachedResponse = { data: responseData, cachedAt: now };

    const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

    return NextResponse.json(responseData, {
      status: httpStatus,
      headers: {
        "Cache-Control": "public, max-age=10",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/health error:", message);
    return NextResponse.json(
      {
        success: false,
        data: {
          status: "unhealthy",
          version: process.env.npm_package_version || "0.1.0",
          timestamp: new Date().toISOString(),
          uptime: Math.floor((Date.now() - startTime) / 1000),
          checks: {
            database: { status: "unhealthy", latencyMs: -1 },
            cache: { status: "unhealthy", hitRate: 0 },
          },
        },
      },
      { status: 503 }
    );
  }
}
