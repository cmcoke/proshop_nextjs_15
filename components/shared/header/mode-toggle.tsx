/**
 * This code block defines the `ModeToggle` component
 * which allows users to switch between different theme modes
 * (system, light, dark) using a dropdown menu.
 **/

"use client";

import { useEffect, useState } from "react"; // Imports useEffect and useState hooks from React.
import { useTheme } from "next-themes"; // Imports the useTheme hook from the next-themes library.
import { Button } from "@/components/ui/button"; // Imports the Button component from the ui library.
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Imports dropdown menu components.
import { MoonIcon, SunIcon, SunMoon } from "lucide-react"; // Imports icons from lucide-react for theme representation.

const ModeToggle = () => {
  const [mounted, setMounted] = useState(false); // Initializes the mounted state to false.
  const { theme, setTheme } = useTheme(); // Destructures theme and setTheme from useTheme hook.

  // useEffect hook that sets the mounted state to true when the component is first rendered.
  useEffect(() => {
    setMounted(true);
  }, []); // Runs only once when the component mounts.

  // If the component is not yet mounted, render nothing.
  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="focus-visible:ring-0 focus-visible:ring-offset-0">
          {/* Renders different icons based on the current theme */}
          {theme === "system" ? <SunMoon /> : theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel> {/* Label for the dropdown menu */}
        <DropdownMenuSeparator /> {/* Separator line in the dropdown menu */}
        <DropdownMenuCheckboxItem checked={theme === "system"} onClick={() => setTheme("system")}>
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === "light"} onClick={() => setTheme("light")}>
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === "dark"} onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;
