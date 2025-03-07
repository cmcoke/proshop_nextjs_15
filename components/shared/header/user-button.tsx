/**
 * This block of code defines a user authentication button using Next.js and custom UI components.
 * - Displays a sign-in button if the user is not authenticated.
 * - Shows a dropdown menu with user details and a sign-out option if the user is authenticated.
 * - Uses custom UI components for buttons and dropdown menus.
 */

import Link from "next/link"; // Imports the Link component from Next.js for client-side navigation.
import { auth } from "@/auth"; // Imports the auth function for managing user authentication.
import { Button } from "@/components/ui/button"; // Imports a custom Button component from the specified path.
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Imports custom DropdownMenu components for creating dropdown menus.
import { signOutUser } from "@/lib/actions/user.actions"; // Imports the signOutUser function for handling user sign-out actions.
import { UserIcon } from "lucide-react"; // Imports the UserIcon component from lucide-react for displaying a user icon.

const UserButton = async () => {
  const session = await auth(); // Checks if a user session exists using the auth function.

  // Renders a sign-in button if no user session is found.
  if (!session) {
    return (
      <Button asChild>
        <Link href="/api/auth/signin">
          <UserIcon /> Sign In
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? ""; // Extracts the first initial of the user's name and converts it to uppercase.

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button variant="ghost" className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-300">
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <Link className="w-full" href="/user/profile">
              User Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/user/orders">
              Order History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 mb-1">
            <form action={signOutUser} className="w-full">
              <Button className="w-full py-4 px-2 h-4 justify-start" variant="ghost">
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton; // Exports the UserButton component as the default export.
