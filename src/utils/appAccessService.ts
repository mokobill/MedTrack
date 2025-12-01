import { createClient } from '@supabase/supabase-js';
import { getCurrentDate } from './dateUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const trackAppAccess = async (userIdentifier: string) => {
  try {
    const today = getCurrentDate();

    const { data: existingLog, error: selectError } = await supabase
      .from('app_access_logs')
      .select('id, access_count')
      .eq('user_identifier', userIdentifier)
      .eq('access_date', today)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error fetching access log:', selectError);
      return;
    }

    if (existingLog) {
      const { error: updateError } = await supabase
        .from('app_access_logs')
        .update({
          access_count: existingLog.access_count + 1,
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLog.id);

      if (updateError) {
        console.error('Error updating access log:', updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('app_access_logs')
        .insert({
          user_identifier: userIdentifier,
          access_date: today,
          access_count: 1,
          last_accessed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting access log:', insertError);
      }
    }
  } catch (error) {
    console.error('Error tracking app access:', error);
  }
};

export const getWeeklyAccessStats = async (userIdentifier: string, startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('app_access_logs')
      .select('access_date, access_count')
      .eq('user_identifier', userIdentifier)
      .gte('access_date', startDate)
      .lte('access_date', endDate)
      .order('access_date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly access stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting weekly access stats:', error);
    return [];
  }
};

export const getTotalWeeklyAccess = async (userIdentifier: string, startDate: string, endDate: string) => {
  const stats = await getWeeklyAccessStats(userIdentifier, startDate, endDate);
  return stats.reduce((total, stat) => total + stat.access_count, 0);
};
