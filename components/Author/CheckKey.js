export default function CheckKey({id}) {
  const Ids = process.env.ALLOWED_USERS_ID?.split(',') || [];
  console.log('Allowed IDs:', Ids);
  console.log('DEFAULT_SESSION_ID:',process.env.DEFAULT_SESSION_ID)
  const isAllowed = Ids.includes(id);

    return isAllowed;
}
