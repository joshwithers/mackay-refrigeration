import type { APIRoute } from 'astro';
import { revokeSession } from '../../server/auth';

export const prerender = false;

export const GET: APIRoute = async ({ redirect }) => redirect('/crm', 303);

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await revokeSession(cookies.get('crm_session')?.value);
  cookies.delete('crm_session', { path: '/' });
  return redirect('/crm/login', 303);
};
