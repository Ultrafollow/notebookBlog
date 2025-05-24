export async function CheckKey({id}) {
  const Ids = process.env.NEXT_PUBLIC_ALLOWED_USERS_ID?.split(',') || [];
  const isAllowed = Ids.includes(id);

    return isAllowed;
}
