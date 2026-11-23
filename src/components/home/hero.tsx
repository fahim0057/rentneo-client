"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-card">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-block rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            Equipment rental marketplace
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Rent the gear you need.{" "}
            <span className="text-primary">Earn from the gear you own.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            From generators to cameras, find verified equipment near you, book it for exactly as long
            as you need, and pay securely online.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/equipment" className={buttonVariants({ size: "lg" })}>
              Browse equipment
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "outline", size: "lg" })}>
              List your equipment
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto w-full max-w-md md:max-w-none"
        >
          <Image
          src="/hero-illustration.svg"
                    alt="An excavator, a camera on a tripod, a speaker and a ladder against an ember sunset"
                      width={900}
                      height={900}
                       priority
                                unoptimized
                      className="aspect-square w-full rounded-2xl border object-cover shadow-2xl"
/>
        </motion.div>
      </div>
    </section>
  );
}