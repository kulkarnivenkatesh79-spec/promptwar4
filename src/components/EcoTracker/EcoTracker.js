/**
 * @fileoverview Gamified Sustainability Dashboard with point system, achievements,
 * progress rings, leaderboard, and carbon calculator.
 * @module components/EcoTracker/EcoTracker
 */

import { escapeHTML } from '../../core/security.js';
import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { ecoActions, leaderboard, achievements, calculateCarbonSaved, checkAchievements, getGlobalEcoStats } from '../../data/mockEcoData.js';

/**
 * Creates the Eco Tracker component.
 * @returns {Object} Component with render, mount, unmount methods
 */
export default function EcoTracker() {
  const cleanupFns = [];
  let userPoints = 475;
  let userActions = [];
  let carbonSaved = 18.5;
  let earnedAchievements = ['green-starter'];

  function render() {
    const treeEquivalent = Math.round(carbonSaved / 22);
    const globalStats = getGlobalEcoStats();

    return `
      <div class="flex flex-col gap-6">
        <!-- Stats Overview -->
        <div class="dashboard-grid dashboard-grid--4">
          <article class="glass-card stat-card" role="article" aria-label="Your green points: ${userPoints}">
            <span class="stat-card__label">${escapeHTML(t('eco.yourPoints'))}</span>
            <span class="stat-card__value">${userPoints}</span>
            <span class="stat-card__delta stat-card__delta--up">🌱 Growing!</span>
          </article>
          <article class="glass-card stat-card" role="article" aria-label="Carbon saved: ${carbonSaved} kilograms">
            <span class="stat-card__label">${escapeHTML(t('eco.carbonSaved'))}</span>
            <span class="stat-card__value">${carbonSaved.toFixed(1)}<span style="font-size: var(--text-sm); -webkit-text-fill-color: var(--color-text-muted);">kg</span></span>
            <span class="stat-card__delta stat-card__delta--up">↑ 2.3kg today</span>
          </article>
          <article class="glass-card stat-card" role="article" aria-label="Trees equivalent: ${treeEquivalent}">
            <span class="stat-card__label">${escapeHTML(t('eco.treesEquivalent'))}</span>
            <span class="stat-card__value">🌳 ${treeEquivalent}</span>
          </article>
          <article class="glass-card stat-card" role="article" aria-label="Global participants: ${globalStats.totalParticipants.toLocaleString()}">
            <span class="stat-card__label">Global Fans</span>
            <span class="stat-card__value" style="font-size: var(--text-2xl);">${(globalStats.totalParticipants / 1000).toFixed(0)}K</span>
            <span class="stat-card__delta stat-card__delta--up">↑ ${globalStats.dailyGrowth}% today</span>
          </article>
        </div>

        <!-- Progress Ring -->
        <section class="glass-card text-center" aria-labelledby="eco-progress-heading">
          <h3 id="eco-progress-heading" style="margin-bottom: var(--space-4);">Tournament Goal Progress</h3>
          <div class="flex justify-center items-center gap-8">
            ${renderProgressRing(userPoints, 1000, 'Personal Goal', 'var(--color-accent-cyan)')}
            ${renderProgressRing(globalStats.totalCarbonSaved, 2000000, 'Global CO₂ Goal', 'var(--color-accent-green)')}
          </div>
        </section>

        <!-- Earn Points Actions -->
        <section aria-labelledby="eco-actions-heading">
          <h3 id="eco-actions-heading" style="margin-bottom: var(--space-4);">
            🎯 ${escapeHTML(t('eco.actions'))}
          </h3>
          <div class="dashboard-grid dashboard-grid--auto" id="eco-actions-grid">
            ${ecoActions.map((action) => renderActionCard(action)).join('')}
          </div>
        </section>

        <!-- Achievements -->
        <section aria-labelledby="eco-achievements-heading">
          <h3 id="eco-achievements-heading" style="margin-bottom: var(--space-4);">
            🏆 ${escapeHTML(t('eco.achievements'))}
          </h3>
          <div class="dashboard-grid dashboard-grid--4" id="eco-achievements-grid">
            ${achievements.map((a) => renderAchievement(a)).join('')}
          </div>
        </section>

        <!-- Leaderboard -->
        <section class="glass-card" aria-labelledby="eco-leaderboard-heading">
          <h3 id="eco-leaderboard-heading" style="margin-bottom: var(--space-4);">
            🏅 ${escapeHTML(t('eco.leaderboard'))}
          </h3>
          <div class="eco-leaderboard" role="list" aria-label="Fan sustainability leaderboard">
            ${leaderboard.map((entry) => renderLeaderboardRow(entry)).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderProgressRing(current, max, label, color) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(100, Math.round((current / max) * 100));
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <div style="text-align: center;" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}: ${percentage}%">
        <svg width="160" height="160" class="progress-ring">
          <circle class="progress-ring__bg" cx="80" cy="80" r="${radius}" stroke-width="10" />
          <circle class="progress-ring__fill" cx="80" cy="80" r="${radius}" stroke-width="10"
            stroke="${color}"
            stroke-dasharray="${circumference}"
            style="--progress-circumference: ${circumference}; --progress-offset: ${offset}; stroke-dashoffset: ${offset};" />
          <text x="80" y="75" text-anchor="middle" fill="var(--color-text-primary)" font-size="22" font-weight="700" font-family="var(--font-display)">${percentage}%</text>
          <text x="80" y="95" text-anchor="middle" fill="var(--color-text-muted)" font-size="10">${escapeHTML(label)}</text>
        </svg>
      </div>
    `;
  }

  function renderActionCard(action) {
    return `
      <article class="glass-card" style="text-align: center; cursor: pointer;" role="button" tabindex="0"
        data-eco-action="${action.id}"
        aria-label="${escapeHTML(action.label)}: earn ${action.points} points. ${escapeHTML(action.description)}">
        <div style="font-size: var(--text-3xl); margin-bottom: var(--space-2);">${action.icon}</div>
        <div style="font-weight: var(--weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);">${escapeHTML(action.label)}</div>
        <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-2);">${escapeHTML(action.description)}</div>
        <span class="badge badge--success">+${action.points} pts</span>
      </article>
    `;
  }

  function renderAchievement(achievement) {
    const isEarned = earnedAchievements.includes(achievement.id);

    return `
      <article class="glass-card text-center ${isEarned ? '' : 'opacity-50'}"
        style="${isEarned ? 'border-color: rgba(255, 215, 64, 0.3);' : ''}"
        role="article" aria-label="${escapeHTML(achievement.title)}: ${isEarned ? 'Earned' : 'Locked'}. ${escapeHTML(achievement.description)}">
        <div style="font-size: var(--text-3xl); margin-bottom: var(--space-2); ${isEarned ? '' : 'filter: grayscale(1);'}">${achievement.icon}</div>
        <div style="font-weight: var(--weight-semibold); font-size: var(--text-sm);">${escapeHTML(achievement.title)}</div>
        <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-1);">
          ${isEarned ? '✅ Earned' : '🔒 Locked'}
        </div>
      </article>
    `;
  }

  function renderLeaderboardRow(entry) {
    const rankClass = entry.rank === 1 ? 'eco-leaderboard__rank--gold' : entry.rank === 2 ? 'eco-leaderboard__rank--silver' : entry.rank === 3 ? 'eco-leaderboard__rank--bronze' : '';

    return `
      <div class="eco-leaderboard__row" role="listitem" aria-label="Rank ${entry.rank}: ${escapeHTML(entry.name)} from ${entry.country}, ${entry.points} points">
        <span class="eco-leaderboard__rank ${rankClass}">#${entry.rank}</span>
        <div>
          <span style="font-weight: var(--weight-semibold);">${entry.country} ${escapeHTML(entry.name)}</span>
          <span style="font-size: var(--text-xs); color: var(--color-text-muted); margin-left: var(--space-2);">${entry.carbonSaved}kg CO₂</span>
        </div>
        <span class="gradient-text" style="font-weight: var(--weight-bold);">${entry.points.toLocaleString()}</span>
      </div>
    `;
  }

  function mount() {
    const grid = document.getElementById('eco-actions-grid');
    if (grid) {
      const handleAction = (e) => {
        const card = e.target.closest('[data-eco-action]');
        if (!card) return;

        const actionId = card.getAttribute('data-eco-action');
        const action = ecoActions.find((a) => a.id === actionId);
        if (!action) return;

        userPoints += action.points;
        userActions.push({ ...action, timestamp: Date.now() });
        carbonSaved = calculateCarbonSaved(userActions) + 18.5;

        const newAchievements = checkAchievements(userPoints, userActions, carbonSaved);
        const newlyEarned = newAchievements.filter((a) => !earnedAchievements.includes(a.id));
        earnedAchievements = newAchievements.map((a) => a.id);

        card.style.transform = 'scale(0.95)';
        card.style.borderColor = 'rgba(105, 240, 174, 0.5)';
        setTimeout(() => {
          card.style.transform = '';
          card.style.borderColor = '';
        }, 300);

        store.dispatch('eco.addPoints', action.points);
        store.dispatch('eco.addAction', { type: action.type, points: action.points, label: action.label });
        store.dispatch('eco.setCarbonSaved', carbonSaved);

        store.dispatch('ui.addToast', {
          type: 'success',
          title: `+${action.points} Green Points!`,
          message: `${action.icon} ${action.label} completed!`
        });

        announceToScreenReader(`Earned ${action.points} points for ${action.label}. Total: ${userPoints} points.`);

        newlyEarned.forEach((achievement) => {
          store.dispatch('eco.addAchievement', achievement);
          store.dispatch('ui.addToast', {
            type: 'success',
            title: '🏆 Achievement Unlocked!',
            message: `${achievement.icon} ${achievement.title}`
          });
          announceToScreenReader(`Achievement unlocked: ${achievement.title}`);
        });
      };

      const handleKeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction(e);
        }
      };

      grid.addEventListener('click', handleAction);
      grid.addEventListener('keydown', handleKeydown);
      cleanupFns.push(() => {
        grid.removeEventListener('click', handleAction);
        grid.removeEventListener('keydown', handleKeydown);
      });
    }
  }

  function unmount() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns.length = 0;
  }

  return { render, mount, unmount };
}
