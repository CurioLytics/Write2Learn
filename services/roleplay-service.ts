'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayScenario } from '@/types/roleplay';
import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';

/**
 * Service xử lý các API liên quan đến tính năng Role-play
 */
class RoleplayService {
  /**
   * Lấy danh sách tình huống roleplay từ Supabase
   */
  async getScenarios(): Promise<RoleplayScenario[]> {
    try {
      const supabase = createClientComponentClient();
      
      // Thêm timeout để xử lý lỗi mạng
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const { data, error } = await supabase
        .from('roleplays')
        .select('id, name, context, starter_message, task, level, topic, ai_role, partner_prompt, image');
        
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Error fetching roleplay scenarios:', error);
        throw new Error('Failed to load roleplay scenarios');
      }
      
      // Biến đổi dữ liệu để đảm bảo tuân thủ RoleplayScenario interface
      const scenarios = data.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        context: scenario.context,
        starter_message: scenario.starter_message,
        task: scenario.task,
        level: scenario.level,
        topic: scenario.topic,
        ai_role: scenario.ai_role,
        partner_prompt: scenario.partner_prompt,
        image: scenario.image 
      }));
      
      return scenarios;
    } catch (error) {
      console.error('Error in getScenarios:', error);
      throw error;
    }
  }
  
  /**
   * Lấy chi tiết một tình huống dựa trên ID
   */
  async getScenarioById(id: string): Promise<RoleplayScenario> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('roleplays')
        .select('id, name, context, starter_message, task, level, topic, ai_role, partner_prompt, image')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching roleplay scenario with id ${id}:`, error);
        throw new Error('Failed to load roleplay scenario');
      }
      
      if (!data) {
        throw new Error('Scenario not found');
      }
      
      // Debug: Log the raw data from database
      console.log('Raw data from database:', {
        id: data.id,
        name: data.name,
        partner_prompt: data.partner_prompt,
        partner_prompt_type: typeof data.partner_prompt
      });
      
      // Biến đổi dữ liệu để đảm bảo tuân thủ RoleplayScenario interface
      const scenario: RoleplayScenario = {
        id: data.id,
        name: data.name,
        context: data.context,
        starter_message: data.starter_message,
        task: data.task,
        level: data.level,
        topic: data.topic,
        ai_role: data.ai_role,
        partner_prompt: data.partner_prompt,
        image: data.image 
      };
      
      // Debug: Log the processed scenario
      console.log('Processed scenario:', {
        id: scenario.id,
        name: scenario.name,
        partner_prompt: scenario.partner_prompt,
        partner_prompt_type: typeof scenario.partner_prompt
      });
      
      return scenario;
    } catch (error) {
      console.error(`Error in getScenarioById:`, error);
      throw error;
    }
  }
  
  /**
   * Lấy danh sách tất cả các chủ đề có sẵn
   */
  async getTopics(): Promise<string[]> {
    try {
      const scenarios = await this.getScenarios();
      
      // Lấy danh sách topics duy nhất
      const topics = [...new Set(scenarios.map(scenario => scenario.topic))];
      
      return topics;
    } catch (error) {
      console.error('Error getting topics:', error);
      throw error;
    }
  }
}

export const roleplayService = new RoleplayService();

/**
 * Hook để sử dụng danh sách tình huống roleplay với cache
 * @param topic Filter theo chủ đề (không bắt buộc)
 */
export function useRoleplayScenarios(topic?: string) {
  const { user } = useAuth();
  
  const { 
    data: scenarios, 
    loading, 
    error,
    refresh
  } = useCachedFetch<RoleplayScenario[]>({
    key: `roleplay-scenarios-${topic || 'all'}`,
    duration: 5 * 60 * 1000, // 5 minutes cache
    dependencyArray: [user?.id, topic],
    fetcher: async () => {
      const allScenarios = await roleplayService.getScenarios();
      
      // Nếu có topic, lọc kết quả
      if (topic) {
        return allScenarios.filter(scenario => scenario.topic === topic);
      }
      
      return allScenarios;
    },
    fallback: []
  });
  
  return {
    scenarios,
    loading,
    error,
    refresh
  };
}

/**
 * Hook để lấy danh sách tất cả các chủ đề với cache
 */
export function useRoleplayTopics() {
  const { user } = useAuth();
  
  const {
    data: topics,
    loading,
    error
  } = useCachedFetch<string[]>({
    key: 'roleplay-topics',
    duration: 10 * 60 * 1000, // 10 minutes cache
    dependencyArray: [user?.id],
    fetcher: async () => {
      return await roleplayService.getTopics();
    },
    fallback: []
  });
  
  return {
    topics,
    loading,
    error
  };
}