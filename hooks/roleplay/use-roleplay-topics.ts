import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';
import { roleplayScenarioService } from '@/services/roleplay/roleplay-scenario-service';

/**
 * Hook to fetch all roleplay topics with caching
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
      return await roleplayScenarioService.getTopics();
    },
    fallback: []
  });
  
  return {
    topics,
    loading,
    error
  };
}
