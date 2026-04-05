"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchDevices } from "@/lib/api-client";
import type { DeviceDto } from "@/lib/types";
import { SELECTED_DEVICE_STORAGE_KEY } from "@/lib/storage/selected-device";
import { getErrorMessage } from "@/lib/utils/error-message";

/**
 * Carrega dispositivos, mantém seleção sincronizada com `localStorage`
 * e restaura a última escolha quando possível.
 */
export function useDevicesWithPersistedSelection(
  storageKey: string = SELECTED_DEVICE_STORAGE_KEY,
) {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Erro ao carregar números"));
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    if (devices.length === 0) {
      setSelectedDeviceId("");
      return;
    }
    setSelectedDeviceId((prev) => {
      if (prev && devices.some((d) => d.id === prev)) return prev;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(storageKey);
        if (saved && devices.some((d) => d.id === saved)) return saved;
      }
      return devices[0].id;
    });
  }, [devices, storageKey]);

  useEffect(() => {
    if (selectedDeviceId && typeof window !== "undefined") {
      localStorage.setItem(storageKey, selectedDeviceId);
    }
  }, [selectedDeviceId, storageKey]);

  return {
    devices,
    loadingDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    loadDevices,
  };
}
