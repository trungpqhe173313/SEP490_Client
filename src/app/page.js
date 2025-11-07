"use client";
import React, { useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import Hero from "@/components/HomePage/hero";
import CallToAction from "@/components/HomePage/cta";
import Feature from "@/components/HomePage/feature";
import AboutUs from "@/components/HomePage/aboutUs";
import Statistic from "@/components/HomePage/statistic";

export default function Home() {
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div>
      <Hero />
      <Feature />
      <Statistic />
      <AboutUs />
      <CallToAction />
    </div>
  );
}
