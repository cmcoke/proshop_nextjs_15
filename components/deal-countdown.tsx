/**
 * This React component, `DealCountdown`, displays a countdown timer until a target date (March 25, 2025).
 * It calculates the remaining time dynamically and updates every second using `useEffect` and `useState`.
 * If the countdown reaches zero, it displays a message indicating that the deal has ended.
 * The countdown UI consists of dynamically updated time values (days, hours, minutes, seconds) and a promotional image.
 * The component handles hydration by showing a loading message before the countdown data is available.
 */

"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

// Defines the target date for the countdown (March 25, 2025, at midnight)
const TARGET_DATE = new Date("2025-03-25T00:00:00");

// Function to calculate the remaining time until the target date
const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date(); // Gets the current date and time
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0); // Ensures no negative values

  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)), // Calculates remaining days
    hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), // Calculates remaining hours
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)), // Calculates remaining minutes
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000) // Calculates remaining seconds
  };
};

// Main countdown component
const DealCountdown = () => {
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>(); // Manages the countdown state

  useEffect(() => {
    // Initializes countdown on component mount
    setTime(calculateTimeRemaining(TARGET_DATE));

    // Updates countdown every second
    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(TARGET_DATE);
      setTime(newTime);

      // Stops the countdown when it reaches zero
      if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval); // Cleans up interval when component unmounts
  }, []);

  // Displays a loading message while the countdown initializes
  if (!time) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Loading Countdown...</h3>
        </div>
      </section>
    );
  }

  // Displays a message if the countdown has ended
  if (time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Deal Has Ended</h3>
          <p>This deal is no longer available. Check out our latest promotions!</p>
          <div className="text-center">
            <Button asChild>
              <Link href="/search">View Products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Image src="/images/promo.jpg" alt="promotion" width={300} height={200} />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 my-20">
      <div className="flex flex-col gap-2 justify-center">
        <h3 className="text-3xl font-bold">Deal Of The Month</h3>
        <p>Get ready for a shopping experience like never before with our Deals of the Month! Every purchase comes with exclusive perks and offers, making this month a celebration of savvy choices and amazing deals. Don&apos;t miss out! 🎁🛒</p>
        <ul className="grid grid-cols-4">
          <StatBox label="Days" value={time.days} />
          <StatBox label="Hours" value={time.hours} />
          <StatBox label="Minutes" value={time.minutes} />
          <StatBox label="Seconds" value={time.seconds} />
        </ul>
        <div className="text-center">
          <Button asChild>
            <Link href="/search">View Products</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Image src="/images/promo.jpg" alt="promotion" width={300} height={200} />
      </div>
    </section>
  );
};

// Component to display countdown values
const StatBox = ({ label, value }: { label: string; value: number }) => (
  <li className="p-4 w-full text-center">
    <p className="text-3xl font-bold">{value}</p>
    <p>{label}</p>
  </li>
);

export default DealCountdown;
