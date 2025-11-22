import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';
import { RoleplayScenario } from '@/types/roleplay';
import { roleplayScenarioService } from '@/services/roleplay/roleplay-scenario-service';

/**
 * Hook to fetch roleplay scenarios with caching
 * @param topic Optional filter by topic
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
      const allScenarios = await roleplayScenarioService.getScenarios();
      
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
