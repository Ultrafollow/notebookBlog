export default function CheckKey({id}) {
  const Ids = process.env.ALLOWED_USERS_ID?.split(',') || [];
  console.log('Allowed IDs:', Ids);
  const isAllowed = Ids.includes(id);

    return isAllowed;
}
