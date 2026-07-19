/**
 * Wrapper around fetch for admin panel API calls.
 * Automatically redirects to the admin login page on 401.
 */
export async function adminFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    window.location.href = "/legatee/admin/panel";
  }
  return res;
}
