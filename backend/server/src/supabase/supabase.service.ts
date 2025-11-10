import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import configuration from '../core/config';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const config = configuration();
    this.client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}