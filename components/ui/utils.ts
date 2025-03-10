import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return "";
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatAmount(amount: number, decimals = 2): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function getRandomGradient(): string {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-400 to-blue-500",
    "from-purple-500 to-pink-500",
    "from-yellow-400 to-orange-500",
    "from-pink-500 to-red-500",
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
} 