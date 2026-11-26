import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';
import { generateId } from '../utils/formatters';

// Never fall back to browser storage or mock data.
const requireSupabase = () => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase is not configured. Check your .env settings.');
  }

  return supabase;
};

const checkError = (error) => {
  if (error) {
    throw new Error(error.message || 'Supabase database operation failed.');
  }
};

const fetchRows = async (table) => {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  checkError(error);
  return data ?? [];
};

const insertRow = async (table, record) => {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from(table)
    .insert([record])
    .select();

  checkError(error);

  if (!data?.[0]) {
    throw new Error(`Could not create record in ${table}.`);
  }

  return data[0];
};

const updateRow = async (table, id, changes) => {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from(table)
    .update(changes)
    .eq('id', id)
    .select();

  checkError(error);

  if (!data?.[0]) {
    throw new Error(`Record not found or update not permitted in ${table}.`);
  }

  return data[0];
};

const deleteRow = async (table, id) => {
  const supabase = requireSupabase();

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  checkError(error);
  return true;
};

// Public views are used only when direct table access is denied.
const fetchWithPublicView = async (table, publicView) => {
  const supabase = requireSupabase();

  const result = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  if (!result.error) {
    return result.data ?? [];
  }

  const publicResult = await supabase
    .from(publicView)
    .select('*')
    .order('created_at', { ascending: false });

  checkError(publicResult.error);
  return publicResult.data ?? [];
};

export const dataService = {
  isSupabaseActive() {
    return Boolean(getSupabaseClient());
  },

  getDbStatus() {
    const { isConfigured, supabaseUrl } = getSupabaseConfig();

    return {
      connected: isConfigured,
      type: 'Supabase Cloud Database',
      url: isConfigured ? supabaseUrl : 'Not configured',
    };
  },

  // ===================== PROPERTIES =====================

  async getProperties() {
    return fetchRows('properties');
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

    return insertRow('properties', newProperty);
  },

  async updateProperty(id, propertyData) {
    return updateRow('properties', id, propertyData);
  },

  async deleteProperty(id) {
    return deleteRow('properties', id);
  },

  // ===================== OWNERS =====================

  async getOwners() {
    return fetchWithPublicView('owners', 'public_owners');
  },

  async addOwner(ownerData) {
    const newOwner = {
      ...ownerData,
      id: ownerData.id || generateId('own'),
      created_at: new Date().toISOString(),
    };

    return insertRow('owners', newOwner);
  },

  async updateOwner(id, ownerData) {
    return updateRow('owners', id, ownerData);
  },

  async deleteOwner(id) {
    return deleteRow('owners', id);
  },

  // ===================== AGENTS =====================

  async getAgents() {
    return fetchWithPublicView('agents', 'public_agents');
  },

  async addAgent(agentData) {
    const newAgent = {
      ...agentData,
      id: agentData.id || generateId('agt'),
      rating: agentData.rating === '' || agentData.rating == null ? null : Number(agentData.rating),
      deals_closed: agentData.deals_closed === '' || agentData.deals_closed == null ? null : Number(agentData.deals_closed),
      created_at: new Date().toISOString(),
    };

    return insertRow('agents', newAgent);
  },

  async updateAgent(id, agentData) {
    return updateRow('agents', id, agentData);
  },

  async deleteAgent(id) {
    return deleteRow('agents', id);
  },

  // ===================== CUSTOMERS =====================

  async getCustomers() {
    return fetchRows('customers');
  },

  async addCustomer(customerData) {
    const newCustomer = {
      ...customerData,
      id: customerData.id || generateId('cust'),
      registration_date:
        customerData.registration_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    return insertRow('customers', newCustomer);
  },

  async updateCustomer(id, customerData) {
    return updateRow('customers', id, customerData);
  },

  async deleteCustomer(id) {
    return deleteRow('customers', id);
  },

  // ===================== BOOKINGS =====================

  async getBookings() {
    return fetchRows('bookings');
  },

  async addBooking(bookingData) {
    const newBooking = {
      ...bookingData,
      id: bookingData.id || generateId('bk'),
      status: bookingData.status || 'Pending',
      created_at: new Date().toISOString(),
    };

    return insertRow('bookings', newBooking);
  },

  async updateBooking(id, updateData) {
    return updateRow('bookings', id, updateData);
  },

  async deleteBooking(id) {
    return deleteRow('bookings', id);
  },

  // ===================== BUYER FAVORITES (SUPABASE RLS) =====================

  async getOrCreateCustomerId(user) {
    if (!user?.id && !user?.email) {
      throw new Error('Authenticated buyer is required.');
    }
    if (user.customer_id) {
      return user.customer_id;
    }

    const supabase = requireSupabase();

    // Try finding existing customer row by user_id or email
    let query = supabase.from('customers').select('id').limit(1);
    if (user.id && user.email) {
      query = query.or(`user_id.eq.${user.id},email.ilike.${user.email}`);
    } else if (user.id) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.ilike('email', user.email);
    }

    const { data: existing, error: findErr } = await query.maybeSingle();
    checkError(findErr);

    if (existing?.id) {
      return existing.id;
    }

    // Create customer row linked to this authenticated user (allowed by RLS)
    const newCustomer = {
      id: generateId('cust'),
      user_id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      phone: user.phone || 'Not provided',
      address: user.address || '',
      budget_range: user.budget_range || '$1M - $3M',
      registration_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const created = await insertRow('customers', newCustomer);
    return created.id;
  },

  async getCustomerFavorites(user) {
    const supabase = requireSupabase();
    const customerId = await this.getOrCreateCustomerId(user);

    const { data, error } = await supabase
      .from('customer_favorites')
      .select('property_id')
      .eq('customer_id', customerId);

    checkError(error);
    return (data ?? []).map((row) => row.property_id);
  },

  async toggleCustomerFavorite(user, propertyId, isCurrentlyFavorite) {
    const supabase = requireSupabase();
    const customerId = await this.getOrCreateCustomerId(user);

    if (isCurrentlyFavorite) {
      const { error } = await supabase
        .from('customer_favorites')
        .delete()
        .eq('customer_id', customerId)
        .eq('property_id', propertyId);
      checkError(error);
    } else {
      const { error } = await supabase
        .from('customer_favorites')
        .insert([
          {
            id: generateId('fav'),
            customer_id: customerId,
            property_id: propertyId,
          },
        ]);
      checkError(error);
    }

    return this.getCustomerFavorites(user);
  },

  // ===================== STORAGE / IMAGE UPLOAD =====================

  async uploadPropertyImage(file) {
    if (!file) {
      throw new Error('Please select an image first.');
    }

    const supabase = requireSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `properties/${fileName}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    checkError(error);

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Image uploaded, but its public URL could not be generated.');
    }

    return data.publicUrl;
  },

  // Sample-data reset is intentionally disabled.
  resetAllData() {
    throw new Error('Reset Sample Data is disabled. No database records were changed.');
  },
};

