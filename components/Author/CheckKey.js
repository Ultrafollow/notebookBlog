
export default function CheckKey({id}) {
  const Ids = process.env.ALLOWED_USERS_ID?.split(',') || [];
  const isAllowed = Ids.includes(id);

    return isAllowed;
}
