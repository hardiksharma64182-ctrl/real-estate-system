import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';
import {
  INITIAL_PROPERTIES,
  INITIAL_OWNERS,
  INITIAL_AGENTS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
} from './mockData';
import { generateId } from '../utils/formatters';

const STORAGE_KEYS = {
  PROPERTIES: 'lux_properties',
  OWNERS: 'lux_owners',
  AGENTS: 'lux_agents',
  CUSTOMERS: 'lux_customers',
  BOOKINGS: 'lux_bookings',
};

// Initialize localStorage with realistic mock data if empty
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.OWNERS)) {
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(INITIAL_OWNERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(INITIAL_AGENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  }
};

// Local storage helper
const getLocal = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const dataService = {
  isSupabaseActive() {
    return Boolean(getSupabaseClient());
  },

  getDbStatus() {
    const { isConfigured, supabaseUrl } = getSupabaseConfig();
    return {
      connected: isConfigured,
      type: isConfigured ? 'Supabase Cloud Database' : 'Local Persistent Storage',
      url: isConfigured ? supabaseUrl : 'browser-local-storage',
    };
  },

  // ===================== PROPERTIES =====================
  async getProperties() {
    initializeLocalStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch properties error, using local fallback:', e);
      }
    }
    return getLocal(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
  },

  async addProperty(propertyData) {
    const newProperty = {
      ...propertyData,
      id: propertyData.id || generateId('prop'),
      price: Number(propertyData.price),
      bedrooms: Number(propertyData.bedrooms) || 0,
      bathrooms: Number(propertyData.bathrooms) || 1,
      area_sqft: Number(propertyData.area_sqft) || 1000,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('properties').insert([newProperty]).select();
        if (!error && data && data[0]) {
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase insert property error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const updated = [newProperty, ...current];
    setLocal(STORAGE_KEYS.PROPERTIES, updated);
    return newProperty;
  },

  async updateProperty(id, propertyData) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id)
          .select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase update property error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const updated = current.map((p) => (p.id === id ? { ...p, ...propertyData } : p));
    setLocal(STORAGE_KEYS.PROPERTIES, updated);
    return updated.find((p) => p.id === id);
  },

  async deleteProperty(id) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('properties').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete property error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const updated = current.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.PROPERTIES, updated);
    return true;
  },

  // ===================== OWNERS =====================
  async getOwners() {
    initializeLocalStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let { data, error } = await supabase.from('owners').select('*').order('created_at', { ascending: false });
        // If non-admin access is restricted by RLS, seamlessly use the public_owners view
        if (error || !data || data.length === 0) {
          const res = await supabase.from('public_owners').select('*').order('created_at', { ascending: false });
          if (!res.error && res.data && res.data.length > 0) return res.data;
        }
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch owners error:', e);
      }
    }
    return getLocal(STORAGE_KEYS.OWNERS, INITIAL_OWNERS);
  },

  async addOwner(ownerData) {
    const newOwner = {
      ...ownerData,
      id: ownerData.id || generateId('own'),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('owners').insert([newOwner]).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase insert owner error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.OWNERS, INITIAL_OWNERS);
    const updated = [newOwner, ...current];
    setLocal(STORAGE_KEYS.OWNERS, updated);
    return newOwner;
  },

  async updateOwner(id, ownerData) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('owners').update(ownerData).eq('id', id).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase update owner error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.OWNERS, INITIAL_OWNERS);
    const updated = current.map((o) => (o.id === id ? { ...o, ...ownerData } : o));
    setLocal(STORAGE_KEYS.OWNERS, updated);
    return updated.find((o) => o.id === id);
  },

  async deleteOwner(id) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('owners').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete owner error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.OWNERS, INITIAL_OWNERS);
    const updated = current.filter((o) => o.id !== id);
    setLocal(STORAGE_KEYS.OWNERS, updated);
    return true;
  },

  // ===================== AGENTS =====================
  async getAgents() {
    initializeLocalStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
        // If direct access to full agent records (phone/email) is restricted, seamlessly use public_agents
        if (error || !data || data.length === 0) {
          const res = await supabase.from('public_agents').select('*').order('created_at', { ascending: false });
          if (!res.error && res.data && res.data.length > 0) return res.data;
        }
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch agents error:', e);
      }
    }
    return getLocal(STORAGE_KEYS.AGENTS, INITIAL_AGENTS);
  },

  async addAgent(agentData) {
    const newAgent = {
      ...agentData,
      id: agentData.id || generateId('agt'),
      rating: Number(agentData.rating) || 4.9,
      deals_closed: Number(agentData.deals_closed) || 10,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('agents').insert([newAgent]).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase insert agent error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.AGENTS, INITIAL_AGENTS);
    const updated = [newAgent, ...current];
    setLocal(STORAGE_KEYS.AGENTS, updated);
    return newAgent;
  },

  async updateAgent(id, agentData) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('agents').update(agentData).eq('id', id).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase update agent error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.AGENTS, INITIAL_AGENTS);
    const updated = current.map((a) => (a.id === id ? { ...a, ...agentData } : a));
    setLocal(STORAGE_KEYS.AGENTS, updated);
    return updated.find((a) => a.id === id);
  },

  async deleteAgent(id) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('agents').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete agent error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.AGENTS, INITIAL_AGENTS);
    const updated = current.filter((a) => a.id !== id);
    setLocal(STORAGE_KEYS.AGENTS, updated);
    return true;
  },

  // ===================== CUSTOMERS =====================
  async getCustomers() {
    initializeLocalStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch customers error:', e);
      }
    }
    return getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  async addCustomer(customerData) {
    const newCustomer = {
      ...customerData,
      id: customerData.id || generateId('cust'),
      registration_date: customerData.registration_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('customers').insert([newCustomer]).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase insert customer error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const updated = [newCustomer, ...current];
    setLocal(STORAGE_KEYS.CUSTOMERS, updated);
    return newCustomer;
  },

  async updateCustomer(id, customerData) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('customers').update(customerData).eq('id', id).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase update customer error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const updated = current.map((c) => (c.id === id ? { ...c, ...customerData } : c));
    setLocal(STORAGE_KEYS.CUSTOMERS, updated);
    return updated.find((c) => c.id === id);
  },

  async deleteCustomer(id) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('customers').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete customer error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const updated = current.filter((c) => c.id !== id);
    setLocal(STORAGE_KEYS.CUSTOMERS, updated);
    return true;
  },

  // ===================== BOOKINGS =====================
  async getBookings() {
    initializeLocalStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch bookings error:', e);
      }
    }
    return getLocal(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  async addBooking(bookingData) {
    const newBooking = {
      ...bookingData,
      id: bookingData.id || generateId('bk'),
      status: bookingData.status || 'Pending',
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').insert([newBooking]).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase insert booking error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = [newBooking, ...current];
    setLocal(STORAGE_KEYS.BOOKINGS, updated);
    return newBooking;
  },

  async updateBooking(id, updateData) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').update(updateData).eq('id', id).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn('Supabase update booking error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = current.map((b) => (b.id === id ? { ...b, ...updateData } : b));
    setLocal(STORAGE_KEYS.BOOKINGS, updated);
    return updated.find((b) => b.id === id);
  },

  async deleteBooking(id) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('bookings').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete booking error:', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = current.filter((b) => b.id !== id);
    setLocal(STORAGE_KEYS.BOOKINGS, updated);
    return true;
  },

  // ===================== STORAGE / IMAGE UPLOAD =====================
  async uploadPropertyImage(file) {
    const supabase = getSupabaseClient();
    if (supabase && file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (e) {
        console.warn('Supabase Storage upload error, falling back to base64:', e);
      }
    }

    // Fallback: convert file to Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  // Reset database to initial sample data
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(INITIAL_OWNERS));
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(INITIAL_AGENTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  },
};
