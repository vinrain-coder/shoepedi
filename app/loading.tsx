"use client";

import { FC, useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // optional utility for conditional classNames
import { Loader } from "lucide-react";

interface LoadingProps {
  loading: boolean;
    delay?: number; // debounce delay in ms
      className?: string;
      }

      /**
       * Global debounced loading component.
        * Appears only after `delay` milliseconds of continuous loading.
         */
         const Loading: FC<LoadingProps> = ({ loading, delay = 300, className }) => {
           const [show, setShow] = useState(false);

             useEffect(() => {
                 let timer: NodeJS.Timeout;

                     if (loading) {
                           // Start timer to show spinner after delay
                                 timer = setTimeout(() => setShow(true), delay);
                                     } else {
                                           // Hide immediately when loading ends
                                                 setShow(false);
                                                       clearTimeout(timer);
                                                           }

                                                               return () => clearTimeout(timer);
                                                                 }, [loading, delay]);

                                                                   if (!show) return null;

                                                                     return (
                                                                         <div
                                                                               className={cn(
                                                                                       "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity",
                                                                                               className
                                                                                                     )}
                                                                                                         >
                                                                                                               <div className="flex flex-col items-center justify-center space-y-2">
                                                                                                                       <Loader className="w-12 h-12 text-primary-foreground animate-spin" />
                                                                                                                               <p className="text-white font-medium text-lg">Loading...</p>
                                                                                                                                     </div>
                                                                                                                                         </div>
                                                                                                                                           );
                                                                                                                                           };

                                                                                                                                           export default Loading;
