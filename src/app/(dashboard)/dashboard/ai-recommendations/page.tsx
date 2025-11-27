"use client";

import { AIRecommendationsDisplay } from "@/components/dashboard/ai/recommendations-display";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { Clock, Lightbulb, RefreshCw } from "lucide-react";

export default function AIRecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();
  const { insights, isLoading, generateInsights } = useAIInsights();

  const handleGenerateInsights = () => {
    generateInsights(undefined, {
      onSuccess: () => {
        toast({
          title: t("ai_insights_generated"),
          description: t("ai_insights_generated_description"),
        });
      },
      onError: error => {
        console.error("Error fetching AI insights:", error);
        toast({
          title: t("error"),
          description: t("ai_insights_failed"),
          variant: "destructive",
        });
      },
    });
  };

  // Check if user has permission to access AI recommendations
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">{t("access_denied")}</h2>
        <p className="text-muted-foreground">{t("super_admin_only")}</p>
      </div>
    );
  }

  const getButtonLabel = () => {
    if (isLoading) return t("generating");
    if (insights) return t("refresh_insights");
    return t("generate_insights");
  };

  const generatedAt = insights?.metadata?.generatedAt;
  const timeAgo = generatedAt
    ? formatDistanceToNow(new Date(generatedAt), { addSuffix: true })
    : null;

  return (
    <>
      <PageHeader
        title={t("ai_insights")}
        description={t("ai_insights_description")}
        actions={
          <div className="flex items-center gap-4">
            {timeAgo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Generated {timeAgo}</span>
              </div>
            )}
            <Button
              onClick={handleGenerateInsights}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {getButtonLabel()}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6">
        {insights && <AIRecommendationsDisplay recommendations={insights} />}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("generating_ai_insights")}
              </p>
            </div>
          </div>
        )}
        {!insights && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("ready_to_generate_insights")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("generate_insights_description")}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
