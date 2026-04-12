'use client';

import type { UserProfile, UserProgress } from '@/types';

interface EthicalProfileReportProps {
  profile: UserProfile;
  progress: UserProgress;
  badges: string[];
  impactScores?: { name: string; score: number }[];
}

export function EthicalProfileReport({
  profile,
  progress,
  badges,
  impactScores,
}: EthicalProfileReportProps) {
  return (
    <div id="ethical-profile-report">
      <div className="section">
        <h1>Ethical Profile Report</h1>
        <h2>{profile.displayName || profile.email || 'Anonymous User'}</h2>
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="section">
        <h2>Progress Summary</h2>
        <div className="stat">
          Stories Completed: {progress.storiesCompleted?.length || 0}
        </div>
        <div className="stat">
          Scenarios Analyzed: {progress.scenariosAnalyzed || 0}
        </div>
        <div className="stat">
          Debates Participated: {progress.debatesParticipated?.length || 0}
        </div>
        <div className="stat">
          Dilemmas Submitted: {progress.dilemmasSubmitted?.length || 0}
        </div>
        <div className="stat">
          Quizzes Taken: {progress.quizResults?.length || 0}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="section">
          <h2>Earned Badges</h2>
          <div>
            {badges.map((badge) => (
              <span key={badge} className="badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {progress.quizResults && progress.quizResults.length > 0 && (
        <div className="section">
          <h2>Ethical Framework Profile</h2>
          <p>
            Dominant framework:{' '}
            {progress.quizResults[progress.quizResults.length - 1]
              ?.dominantFramework || 'Not determined'}
          </p>
        </div>
      )}

      {impactScores && impactScores.length > 0 && (
        <div className="section">
          <h2>Ethical Impact Scores</h2>
          {impactScores.map((score) => (
            <div key={score.name} className="stat">
              {score.name}: {score.score}/100
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
