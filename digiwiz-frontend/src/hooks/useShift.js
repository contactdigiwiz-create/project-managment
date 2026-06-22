import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const useShift = () => {
  const [shift, setShift] = useState(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const fetchShift = async () => {
    try {
      const res = await api.get("/shifts/active");
      if (res.data.shift) {
        setShift(res.data.shift);
        setActiveSeconds(res.data.shift.activeSeconds);
        setBreakSeconds(res.data.shift.totalBreakSeconds);
      } else {
        setShift(null);
        setActiveSeconds(0);
        setBreakSeconds(0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchShift();
  }, []);

  // Tick every second
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (shift?.status === "active") {
      timerRef.current = setInterval(() => {
        setActiveSeconds((s) => s + 1);
      }, 1000);
    } else if (shift?.status === "on_break") {
      timerRef.current = setInterval(() => {
        setBreakSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [shift?.status]);

  const startShift = async () => {
    setLoading(true);
    try {
      await api.post("/shifts/start");
      await fetchShift();
    } finally {
      setLoading(false);
    }
  };

  const endShift = async () => {
    setLoading(true);
    try {
      await api.patch("/shifts/end");
      setShift(null);
      setActiveSeconds(0);
      setBreakSeconds(0);
    } finally {
      setLoading(false);
    }
  };

  const startBreak = async () => {
    setLoading(true);
    try {
      await api.post("/breaks/start");
      await fetchShift();
    } finally {
      setLoading(false);
    }
  };

  const endBreak = async () => {
    setLoading(true);
    try {
      await api.patch("/breaks/end");
      await fetchShift();
    } finally {
      setLoading(false);
    }
  };

  return {
    shift,
    activeTime: formatTime(activeSeconds),
    breakTime: formatTime(breakSeconds),
    isWorking: shift?.status === "active",
    isOnBreak: shift?.status === "on_break",
    clockInTime: shift?.clockInTime
      ? new Date(shift.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "--:--:--",
    loading,
    startShift,
    endShift,
    startBreak,
    endBreak,
  };
};
