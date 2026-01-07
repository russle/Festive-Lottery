// FestiveLottery Workers API
// Cloudflare Workers + D1 Database

export interface Env {
    DB: D1Database;
    ENVIRONMENT: string;
}

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Host-ID',
};

// Helper: JSON Response
const jsonResponse = (data: unknown, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
};

// Helper: Error Response
const errorResponse = (message: string, status = 400) => {
    return jsonResponse({ success: false, error: message }, status);
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Get Host ID from Header
        const hostId = request.headers.get('X-Host-ID') || 'default';

        try {
            // ========== EMPLOYEES ==========
            if (path === '/api/employees') {
                if (method === 'GET') {
                    const { results } = await env.DB.prepare(
                        'SELECT id, name, dept FROM employees WHERE host_id = ? ORDER BY id'
                    ).bind(hostId).all();
                    return jsonResponse({ success: true, data: results });
                }

                if (method === 'POST') {
                    const body = await request.json() as { employees: Array<{ id: string; name: string; dept?: string }> };
                    const { employees: inputEmployees } = body;

                    if (!Array.isArray(inputEmployees)) {
                        return errorResponse('employees must be an array');
                    }

                    // Deduplicate within the incoming list (keep the last one)
                    const employeeMap = new Map();
                    for (const emp of inputEmployees) {
                        if (emp.id) employeeMap.set(emp.id, emp);
                    }
                    const employees = Array.from(employeeMap.values());

                    // Clear existing for this host only and Insert new in batch
                    // Note: We use INSERT OR REPLACE to avoid UNIQUE constraint failures if the same ID exists in another host
                    const statements = [
                        env.DB.prepare('DELETE FROM winners WHERE host_id = ?').bind(hostId),
                        env.DB.prepare('DELETE FROM employees WHERE host_id = ?').bind(hostId)
                    ];

                    for (const emp of employees) {
                        statements.push(
                            env.DB.prepare(
                                'INSERT OR REPLACE INTO employees (id, name, dept, host_id) VALUES (?, ?, ?, ?)'
                            ).bind(emp.id, emp.name, emp.dept || '未分類', hostId)
                        );
                    }

                    await env.DB.batch(statements);
                    return jsonResponse({ success: true, count: employees.length });
                }

                if (method === 'DELETE') {
                    await env.DB.prepare('DELETE FROM winners WHERE host_id = ?').bind(hostId).run();
                    await env.DB.prepare('DELETE FROM employees WHERE host_id = ?').bind(hostId).run();
                    return jsonResponse({ success: true });
                }
            }

            // ========== PRIZES ==========
            if (path === '/api/prizes') {
                if (method === 'GET') {
                    const { results } = await env.DB.prepare(
                        'SELECT id, name, icon, count, type, count_per_round as countPerRound FROM prizes WHERE host_id = ? ORDER BY id'
                    ).bind(hostId).all();
                    return jsonResponse({ success: true, data: results });
                }

                if (method === 'POST') {
                    const body = await request.json() as { prizes: Array<{ id: number; name: string; icon?: string; count?: number; type?: string; countPerRound?: number }> };
                    const { prizes } = body;

                    if (!Array.isArray(prizes)) {
                        return errorResponse('prizes must be an array');
                    }

                    // Clear existing for this host only and Insert new in batch
                    const statements = [
                        env.DB.prepare('DELETE FROM winners WHERE host_id = ?').bind(hostId),
                        env.DB.prepare('DELETE FROM prizes WHERE host_id = ?').bind(hostId)
                    ];

                    for (const prize of prizes) {
                        statements.push(
                            env.DB.prepare(
                                'INSERT OR REPLACE INTO prizes (id, name, icon, count, type, count_per_round, host_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
                            ).bind(
                                prize.id,
                                prize.name,
                                prize.icon || '🎁',
                                prize.count || 1,
                                prize.type || 'single',
                                prize.countPerRound || 1,
                                hostId
                            )
                        );
                    }

                    await env.DB.batch(statements);
                    return jsonResponse({ success: true, count: prizes.length });
                }

                if (method === 'DELETE') {
                    await env.DB.prepare('DELETE FROM winners WHERE host_id = ?').bind(hostId).run();
                    await env.DB.prepare('DELETE FROM prizes WHERE host_id = ?').bind(hostId).run();
                    return jsonResponse({ success: true });
                }
            }

            // ========== WINNERS ==========
            if (path === '/api/winners') {
                if (method === 'GET') {
                    const { results } = await env.DB.prepare(`
                        SELECT 
                            w.id,
                            w.prize_id as prizeId,
                            w.employee_id as employeeId,
                            w.timestamp,
                            e.name as employeeName,
                            e.dept as employeeDept,
                            p.name as prizeName,
                            p.icon as prizeIcon
                        FROM winners w
                        JOIN employees e ON w.employee_id = e.id AND w.host_id = e.host_id
                        JOIN prizes p ON w.prize_id = p.id AND w.host_id = p.host_id
                        WHERE w.host_id = ?
                        ORDER BY w.timestamp DESC
                    `).bind(hostId).all();
                    return jsonResponse({ success: true, data: results });
                }

                if (method === 'POST') {
                    const body = await request.json() as { prizeId: number; employeeId: string };
                    const { prizeId, employeeId } = body;

                    if (!prizeId || !employeeId) {
                        return errorResponse('prizeId and employeeId are required');
                    }

                    await env.DB.prepare(
                        'INSERT INTO winners (prize_id, employee_id, host_id) VALUES (?, ?, ?)'
                    ).bind(prizeId, employeeId, hostId).run();

                    return jsonResponse({ success: true });
                }

                if (method === 'DELETE') {
                    await env.DB.prepare('DELETE FROM winners WHERE host_id = ?').bind(hostId).run();
                    return jsonResponse({ success: true });
                }
            }

            // ========== CHECK WINNER (QR Code Query) ==========
            // Support both /api/check/:id and more robust path splitting
            if (path.includes('/api/check/')) {
                const normalizedPath = path.replace(/\/+/g, '/'); // Fix double slashes
                const parts = normalizedPath.split('/');
                const checkIdx = parts.indexOf('check');
                const employeeId = decodeURIComponent(parts[checkIdx + 1] || '').trim();

                // Allow host ID from URL param or header
                const queryHostId = url.searchParams.get('host') || hostId;

                if (!employeeId) {
                    return errorResponse('Employee ID is required');
                }

                console.log(`[Check] Searching for Emp: ${employeeId} in Host: ${queryHostId}`);

                const { results } = await env.DB.prepare(`
                    SELECT 
                        w.id,
                        w.timestamp,
                        p.name as prizeName,
                        p.icon as prizeIcon,
                        e.name as employeeName,
                        e.dept as employeeDept
                    FROM winners w
                    JOIN prizes p ON w.prize_id = p.id AND w.host_id = p.host_id
                    JOIN employees e ON w.employee_id = e.id AND w.host_id = e.host_id
                    WHERE w.employee_id = ? AND w.host_id = ?
                    ORDER BY w.timestamp DESC
                `).bind(employeeId, queryHostId).all();

                console.log(`[Check] Found ${results.length} records`);

                return jsonResponse({
                    success: true,
                    hasWon: results.length > 0,
                    data: results,
                    debug: { employeeId, hostId: queryHostId } // Add debug info
                });
            }

            // ========== HEALTH CHECK ==========
            if (path === '/api/health') {
                return jsonResponse({ success: true, environment: env.ENVIRONMENT, hostId });
            }

            // 404 Not Found
            return errorResponse('Not Found', 404);

        } catch (error) {
            console.error('API Error:', error);
            return errorResponse(`Internal Server Error: ${error}`, 500);
        }
    },
};
