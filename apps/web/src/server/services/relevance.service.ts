export class RelevanceService {
  private static ERROR_WEIGHT = 0.3;
  private static ENGAGEMENT_WEIGHT = 0.4;
  private static FRUSTRATION_WEIGHT = 0.3;

  public static calculateRelevanceScore(
    frustrationScore: number,
    engagementScore: number,
    errorCount: number
  ): number {
    const normalizedErrorScore = this.normalizeErrorScore(errorCount);
    
    const scaledFrustration = (frustrationScore / 3) * 5;
    const scaledEngagement = (engagementScore / 3) * 5;
    
    const weightedScore = 
      (scaledFrustration * this.FRUSTRATION_WEIGHT) +
      (scaledEngagement * this.ENGAGEMENT_WEIGHT) +
      (normalizedErrorScore * this.ERROR_WEIGHT);
    
    return Math.round(weightedScore);
  }

  private static normalizeErrorScore(errorCount: number): number {
    if (errorCount === 0) return 0;  
    if (errorCount <= 2) return 1.67;
    if (errorCount <= 5) return 3.33;
    return 5;                        
  }
}