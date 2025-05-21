import { signIn, signOut, auth } from "auth"
import { 
  Github,
  School,
  Mail, 
  MapPin 
} from 'lucide-react' // 引入图标库
import DownList from "./DownList"


function SignIn({ provider, ...props }) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider)
      }}
    >
      <button
        {...props}
        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-600 rounded-full hover:bg-gray-200 hover:scale-[1.05] transition-transform cursor-pointer"
      >
        <Github size={22} strokeWidth={2}/>
      </button>
    </form>
  )
}

function SignOut(props) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button
        {...props}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </form>
  )
}
function Avatar({session}) {
  return (
  <div
    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-600 rounded-full hover:bg-gray-200 hover:scale-[1.05] transition-transform cursor-pointer"
  >
      <img 
        src={session?.user?.image}
        className="w-10 h-10 rounded-full border-4 border-blue-200 object-cover object-center"
        alt="avatar"
      />
  </div>
  );
}

export default async function WebAuth() {
  const session = await auth()
  console.log("session", session)
  return (
    <header className="flex justify-start items-center gap-4 rounded-full dark:bg-gray-800 shadow-sm">
      {session?.user ? (
        <span className="flex items-center gap-4">
          {/* <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {session?.user.name}
          </span> */}
          <SignOut />
        </span>
      ) : (
        <SignIn />
      )}
    </header>
  )
}