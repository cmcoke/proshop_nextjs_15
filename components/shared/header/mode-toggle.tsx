/**
 * This component provides a toggle to switch between light, dark, and system themes.
 * It uses the next-themes library to manage themes and a dropdown menu to display options.
 **/

"use client"; // Indicates that this component is a client-side component.

import { useEffect, useState } from "react";
import { useTheme } from "next-themes"; // Imports the useTheme hook from the next-themes library.
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon, SunMoon } from "lucide-react";

const ModeToggle = () => {
  const [mounted, setMounted] = useState(false); // Initializes a state variable to track if the component is mounted.
  const { theme, setTheme } = useTheme(); // Gets the current theme and setTheme function from the useTheme hook.

  // Sets mounted to true when the component mounts.
  useEffect(() => {
    setMounted(true);
  }, []); // Runs only once when the component mounts.

  // Returns null if the component is not mounted (prevents hydration errors).
  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      {/* Renders a dropdown menu. */}
      <DropdownMenuTrigger asChild>
        {/* Renders the trigger button for the dropdown menu. */}
        <Button variant="ghost" className="focus-visible:ring-0 focus-visible:ring-offset-0">
          {/* Renders a ghost button with focus styles. */}
          {theme === "system" ? <SunMoon /> : theme === "dark" ? <MoonIcon /> : <SunIcon />}
          {/* Renders an icon based on the current theme. */}
          {/*
        Conditional Rendering Explanation:
        This line uses a ternary operator to conditionally render an icon based on the current theme.
        - If 'theme' is equal to "system", it renders the <SunMoon /> icon, indicating the system's theme preference.
        - Otherwise, if 'theme' is equal to "dark", it renders the <MoonIcon />, representing the dark theme.
        - If neither of the above conditions is met (meaning the theme is "light" or an unexpected value), it renders the <SunIcon />, representing the light theme.
        This provides a dynamic icon that reflects the currently selected theme.
      */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Renders the content of the dropdown menu. */}
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        {/* Renders a label for the dropdown menu. */}
        <DropdownMenuSeparator />
        {/* Renders a separator in the dropdown menu. */}
        <DropdownMenuCheckboxItem checked={theme === "system"} onClick={() => setTheme("system")}>
          {/* Renders a checkbox item for the system theme. */}
          {/*
        Conditional Rendering Explanation:
        The 'checked' prop of the DropdownMenuCheckboxItem is set to 'theme === "system"'.
        This means the checkbox will be checked only if the current theme is "system".
        This visually indicates to the user that the system theme is currently active.
      */}
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === "light"} onClick={() => setTheme("light")}>
          {/* Renders a checkbox item for the light theme. */}
          {/*
        Conditional Rendering Explanation:
        The 'checked' prop of the DropdownMenuCheckboxItem is set to 'theme === "light"'.
        This means the checkbox will be checked only if the current theme is "light".
        This visually indicates to the user that the light theme is currently active.
      */}
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === "dark"} onClick={() => setTheme("dark")}>
          {/* Renders a checkbox item for the dark theme. */}
          {/*
        Conditional Rendering Explanation:
        The 'checked' prop of the DropdownMenuCheckboxItem is set to 'theme === "dark"'.
        This means the checkbox will be checked only if the current theme is "dark".
        This visually indicates to the user that the dark theme is currently active.
      */}
          Dark
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;
