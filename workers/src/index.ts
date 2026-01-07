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
    'Access-Control-Allow-Headers': 'Content-Type',
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

        try {
            // ========== EMPLOYEES ==========
            if (path === '/api/employees') {
                if (method === 'GET') {
                    const { results } = await env.DB.prepare(
                        'SELECT id, name, dept FROM employees ORDER BY id'
                    ).all();
                    return jsonResponse({ success: true, data: results });
                }

                if (method === 'POST') {
                    const body = await request.json() as { employees: Array<{ id: string; name: string; dept?: string }> };
                    const { employees } = body;

                    if (!Array.isArray(employees)) {
                        return errorResponse('employees must be an array');
                    }

                    // Clear existing and insert new
                    await env.DB.prepare('DELETE FROM employees').run();

                    for (const emp of employees) {
                        await env.DB.prepare(
                            'INSERT INTO employees (id, name, dept) VALUES (?, ?, ?)'
                        ).bind(emp.id, emp.name, emp.dept || '未分類').run();
                    }

                    return jsonResponse({ success: true, count: employees.length });
                }
            }

            // ========== PRIZES ==========
            if (path === '/api/prizes') {
                if (method === 'GET') {
                    const { results } = await env.DB.prepare(
                        'SELECT id, name, icon, count, type, count_per_round as countPerRound FROM prizes ORDER BY id'
                    ).all();
                    return jsonResponse({ success: true, data: results });
                }

                if (method === 'POST') {
                    const body = await request.json() as { prizes: Array<{ id: number; name: string; icon?: string; count?: number; type?: string; countPerRound?: number }> };
                    const { prizes } = body;

                    if (!Array.isArray(prizes)) {
                        return errorResponse('prizes must be an array');
                    }

                    // Clear existing and insert new
                    await env.DB.prepare('DELETE FROM prizes').run();

                    for (const prize of prizes) {
                        await env.DB.prepare(
                            'INSERT INTO prizes (id, name, icon, count, type, count_per_round) VALUES (?, ?, ?, ?, ?, ?)'
                        ).bind(
                            prize.id,
                            prize.name,
                            prize.icon || '🎁',
                            prize.count || 1,
                            prize.type || 'single',
                            prize.countPerRound || 1
                        ).run();
                    }

                    return jsonResponse({ success: true, count: prizes.length });
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
                        JOIN employees e ON w.employee_id = e.id
                        JOIN prizes p ON w.prize_id = p.id
                        ORDER BY w.timestamp DESC
                    `).all();
                    return jsonResponse({ success: true, data: results });
                }

                if (method === 'POST') {
                    const body = await request.json() as { prizeId: number; employeeId: string };
                    const { prizeId, employeeId } = body;

                    if (!prizeId || !employeeId) {
                        return errorResponse('prizeId and employeeId are required');
                    }

                    await env.DB.prepare(
                        'INSERT INTO winners (prize_id, employee_id) VALUES (?, ?)'
                    ).bind(prizeId, employeeId).run();

                    return jsonResponse({ success: true });
                }

                if (method === 'DELETE') {
                    await env.DB.prepare('DELETE FROM winners').run();
                    return jsonResponse({ success: true });
                }
            }

            // ========== CHECK WINNER (QR Code Query) ==========
            if (path.startsWith('/api/check/')) {
                const employeeId = path.replace('/api/check/', '');

                if (!employeeId) {
                    return errorResponse('Employee ID is required');
                }

                const { results } = await env.DB.prepare(`
                    SELECT 
                        w.id,
                        w.timestamp,
                        p.name as prizeName,
                        p.icon as prizeIcon,
                        e.name as employeeName,
                        e.dept as employeeDept
                    FROM winners w
                    JOIN prizes p ON w.prize_id = p.id
                    JOIN employees e ON w.employee_id = e.id
                    WHERE w.employee_id = ?
                    ORDER BY w.timestamp DESC
                `).bind(employeeId).all();

                return jsonResponse({
                    success: true,
                    hasWon: results.length > 0,
                    data: results,
                });
            }

            // ========== HEALTH CHECK ==========
            if (path === '/api/health') {
                return jsonResponse({ success: true, environment: env.ENVIRONMENT });
            }

            // 404 Not Found
            return errorResponse('Not Found', 404);

        } catch (error) {
            console.error('API Error:', error);
            return errorResponse(`Internal Server Error: ${error}`, 500);
        }
    },
};
