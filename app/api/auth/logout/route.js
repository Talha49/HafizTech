export async function POST() {
  return Response.json(
    { message: 'Logged out successfully' },
    {
      status: 200,
      headers: {
        'Set-Cookie': 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
      }
    }
  );
}