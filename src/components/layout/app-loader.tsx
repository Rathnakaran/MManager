
'use client';

import { IndianRupee, PiggyBank, Landmark, CircleDollarSign, Target } from "lucide-react";

const icons = [
    { Icon: IndianRupee, color: 'text-yellow-400' },
    { Icon: PiggyBank, color: 'text-pink-500' },
    { Icon: Landmark, color: 'text-blue-500' },
    { Icon: Target, color: 'text-red-500' },
    { Icon: CircleDollarSign, color: 'text-green-500' },
];

export default function AppLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <div className="relative flex items-center justify-center w-48 h-48">
            {icons.map((item, index) => (
                <div 
                    key={index}
                    className="absolute animate-pulse"
                    style={{
                        animationDelay: `${index * 200}ms`,
                        animationDuration: '1.5s'
                    }}
                >
                    <item.Icon className={`w-8 h-8 ${item.color} opacity-75`} style={{
                        transform: `rotate(${index * (360/icons.length)}deg) translateX(60px) rotate(-${index * (360/icons.length)}deg)`
                    }}/>
                </div>
            ))}
            <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
                 <IndianRupee className="w-10 h-10 text-primary animate-ping" />
            </div>
        </div>
        <p className="text-lg font-semibold text-muted-foreground animate-pulse">
            Loading your financial universe...
        </p>
    </div>
  );
}
