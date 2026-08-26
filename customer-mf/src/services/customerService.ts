import axios from "axios";
import type { Customer } from "../types/customer";

const API_BASE = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await api.get<Customer[]>("/customers/");
    return data;
  },

  getById: async (id: number): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/customers/${id}/`);
    return data;
  },

  create: async (payload: Omit<Customer, "id">): Promise<Customer> => {
    const { data } = await api.post<Customer>("/customers/", payload);
    return data;
  },

  update: async (id: number, payload: Omit<Customer, "id">): Promise<Customer> => {
    const { data } = await api.put<Customer>(`/customers/${id}/`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}/`);
  },
};
