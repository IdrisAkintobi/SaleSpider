'use client'

import { AIRecommendationsDisplay } from '@/components/dashboard/ai/recommendations-display'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { fetchJson } from '@/lib/fetch-utils'
import { useTranslation } from '@/lib/i18n'
import type { AIInsightsData } from '@/types/ai-insights'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function AIRecommendationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const t = useTranslation()
  const [insights, setInsights] = useState<AIInsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      const data = await fetchJson<AIInsightsData>('/api/ai/insights')
      setInsights(data)

      toast({
        title: t('ai_insights_generated'),
        description: t('ai_insights_generated_description'),
      })
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      toast({
        title: t('error'),
        description: t('ai_insights_failed'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Remove auto-fetch on component mount - user must click button to generate

  // Check if user has permission to access AI recommendations
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER')) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">{t('access_denied')}</h2>
        <p className="text-muted-foreground">{t('super_admin_only')}</p>
      </div>
    )
  }

  const getButtonLabel = () => {
    if (isLoading) return t('generating')
    if (insights) return t('refresh_insights')
    return t('generate_insights')
  }

  return (
    <>
      <PageHeader
        title={t('ai_insights')}
        description={t('ai_insights_description')}
        actions={
          <Button
            onClick={fetchInsights}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            {getButtonLabel()}
          </Button>
        }
      />

      <div className="grid gap-6">
        {insights && <AIRecommendationsDisplay recommendations={insights} />}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t('generating_ai_insights')}
              </p>
            </div>
          </div>
        )}
        {!insights && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t('ready_to_generate_insights')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('generate_insights_description')}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
