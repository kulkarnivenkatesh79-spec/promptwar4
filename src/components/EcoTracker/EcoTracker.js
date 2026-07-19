/**
 * @fileoverview Gamified Sustainability Dashboard with point system, achievements,
 * progress rings, leaderboard, and carbon calculator.
 * @module components/EcoTracker/EcoTracker
 */

import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { ecoActions, leaderboard, achievements, calculateCarbonSaved, checkAchievements, getGlobalEcoStats } from '../../data/mockEcoData.js';
import { createElement, replaceChildren } from '../../core/dom.js';

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

    const statCards = [
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Your green points: ${userPoints}` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('eco.yourPoints')]),
        createElement('span', { class: 'stat-card__value', id: 'eco-points-display' }, [userPoints]),
        createElement('span', { class: 'stat-card__delta stat-card__delta--up' }, ['🌱 Growing!'])
      ]),
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Carbon saved: ${carbonSaved} kilograms` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('eco.carbonSaved')]),
        createElement('span', { class: 'stat-card__value', id: 'eco-carbon-display' }, [
          carbonSaved.toFixed(1),
          createElement('span', { style: 'font-size: var(--text-sm); -webkit-text-fill-color: var(--color-text-muted);' }, ['kg'])
        ]),
        createElement('span', { class: 'stat-card__delta stat-card__delta--up' }, ['↑ 2.3kg today'])
      ]),
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Trees equivalent: ${treeEquivalent}` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('eco.treesEquivalent')]),
        createElement('span', { class: 'stat-card__value', id: 'eco-trees-display' }, [`🌳 ${treeEquivalent}`])
      ]),
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Global participants: ${globalStats.totalParticipants.toLocaleString()}` } }, [
        createElement('span', { class: 'stat-card__label' }, ['Global Fans']),
        createElement('span', { class: 'stat-card__value', style: 'font-size: var(--text-2xl);' }, [`${(globalStats.totalParticipants / 1000).toFixed(0)}K`]),
        createElement('span', { class: 'stat-card__delta stat-card__delta--up' }, [`↑ ${globalStats.dailyGrowth}% today`])
      ])
    ];

    return createElement('div', { class: 'flex flex-col gap-6' }, [
      createElement('div', { class: 'dashboard-grid dashboard-grid--4' }, statCards),
      
      createElement('section', { class: 'glass-card text-center', aria: { labelledby: 'eco-progress-heading' } }, [
        createElement('h3', { id: 'eco-progress-heading', style: 'margin-bottom: var(--space-4);' }, ['Tournament Goal Progress']),
        createElement('div', { class: 'flex justify-center items-center gap-8' }, [
          renderProgressRing(userPoints, 1000, 'Personal Goal', 'var(--color-accent-cyan)'),
          renderProgressRing(globalStats.totalCarbonSaved, 2000000, 'Global CO₂ Goal', 'var(--color-accent-green)')
        ])
      ]),

      createElement('section', { aria: { labelledby: 'eco-actions-heading' } }, [
        createElement('h3', { id: 'eco-actions-heading', style: 'margin-bottom: var(--space-4);' }, [`🎯 ${t('eco.actions')}`]),
        createElement('div', { class: 'dashboard-grid dashboard-grid--auto', id: 'eco-actions-grid' }, 
          ecoActions.map((action) => renderActionCard(action))
        )
      ]),

      createElement('section', { aria: { labelledby: 'eco-achievements-heading' } }, [
        createElement('h3', { id: 'eco-achievements-heading', style: 'margin-bottom: var(--space-4);' }, [`🏆 ${t('eco.achievements')}`]),
        createElement('div', { class: 'dashboard-grid dashboard-grid--4', id: 'eco-achievements-grid' }, 
          achievements.map((a) => renderAchievement(a))
        )
      ]),

      createElement('section', { class: 'glass-card', aria: { labelledby: 'eco-leaderboard-heading' } }, [
        createElement('h3', { id: 'eco-leaderboard-heading', style: 'margin-bottom: var(--space-4);' }, [`🏅 ${t('eco.leaderboard')}`]),
        createElement('div', { class: 'eco-leaderboard', role: 'list', aria: { label: 'Fan sustainability leaderboard' } }, 
          leaderboard.map((entry) => renderLeaderboardRow(entry))
        )
      ])
    ]);
  }

  function renderProgressRing(current, max, label, color) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(100, Math.round((current / max) * 100));
    const offset = circumference - (percentage / 100) * circumference;

    const svgNs = "http://www.w3.org/2000/svg";
    const svgEl = document.createElementNS(svgNs, "svg");
    svgEl.setAttribute("width", "160");
    svgEl.setAttribute("height", "160");
    svgEl.setAttribute("class", "progress-ring");

    const bgCircle = document.createElementNS(svgNs, "circle");
    bgCircle.setAttribute("class", "progress-ring__bg");
    bgCircle.setAttribute("cx", "80");
    bgCircle.setAttribute("cy", "80");
    bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("stroke-width", "10");

    const fillCircle = document.createElementNS(svgNs, "circle");
    fillCircle.setAttribute("class", "progress-ring__fill");
    fillCircle.setAttribute("cx", "80");
    fillCircle.setAttribute("cy", "80");
    fillCircle.setAttribute("r", radius);
    fillCircle.setAttribute("stroke-width", "10");
    fillCircle.setAttribute("stroke", color);
    fillCircle.setAttribute("stroke-dasharray", circumference);
    fillCircle.setAttribute("style", `--progress-circumference: ${circumference}; --progress-offset: ${offset}; stroke-dashoffset: ${offset};`);

    const textPct = document.createElementNS(svgNs, "text");
    textPct.setAttribute("x", "80");
    textPct.setAttribute("y", "75");
    textPct.setAttribute("text-anchor", "middle");
    textPct.setAttribute("fill", "var(--color-text-primary)");
    textPct.setAttribute("font-size", "22");
    textPct.setAttribute("font-weight", "700");
    textPct.setAttribute("font-family", "var(--font-display)");
    textPct.textContent = `${percentage}%`;

    const textLabel = document.createElementNS(svgNs, "text");
    textLabel.setAttribute("x", "80");
    textLabel.setAttribute("y", "95");
    textLabel.setAttribute("text-anchor", "middle");
    textLabel.setAttribute("fill", "var(--color-text-muted)");
    textLabel.setAttribute("font-size", "10");
    textLabel.textContent = label;

    svgEl.appendChild(bgCircle);
    svgEl.appendChild(fillCircle);
    svgEl.appendChild(textPct);
    svgEl.appendChild(textLabel);

    return createElement('div', { style: 'text-align: center;', role: 'progressbar', aria: { valuenow: String(percentage), valuemin: '0', valuemax: '100', label: `${label}: ${percentage}%` } }, [svgEl]);
  }

  function renderActionCard(action) {
    return createElement('article', { 
      class: 'glass-card', 
      style: 'text-align: center; cursor: pointer;', 
      role: 'button', 
      tabindex: '0',
      dataset: { ecoAction: action.id },
      aria: { label: `${action.label}: earn ${action.points} points. ${action.description}` }
    }, [
      createElement('div', { style: 'font-size: var(--text-3xl); margin-bottom: var(--space-2);' }, [action.icon]),
      createElement('div', { style: 'font-weight: var(--weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);' }, [action.label]),
      createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-2);' }, [action.description]),
      createElement('span', { class: 'badge badge--success' }, [`+${action.points} pts`])
    ]);
  }

  function renderAchievement(achievement) {
    const isEarned = earnedAchievements.includes(achievement.id);

    return createElement('article', { 
      class: `glass-card text-center ${isEarned ? '' : 'opacity-50'}`,
      style: isEarned ? 'border-color: rgba(255, 215, 64, 0.3);' : '',
      role: 'article', 
      aria: { label: `${achievement.title}: ${isEarned ? 'Earned' : 'Locked'}. ${achievement.description}` }
    }, [
      createElement('div', { style: `font-size: var(--text-3xl); margin-bottom: var(--space-2); ${isEarned ? '' : 'filter: grayscale(1);'}` }, [achievement.icon]),
      createElement('div', { style: 'font-weight: var(--weight-semibold); font-size: var(--text-sm);' }, [achievement.title]),
      createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-1);' }, [
        isEarned ? '✅ Earned' : '🔒 Locked'
      ])
    ]);
  }

  function renderLeaderboardRow(entry) {
    const rankClass = entry.rank === 1 ? 'eco-leaderboard__rank--gold' : entry.rank === 2 ? 'eco-leaderboard__rank--silver' : entry.rank === 3 ? 'eco-leaderboard__rank--bronze' : '';

    return createElement('div', { class: 'eco-leaderboard__row', role: 'listitem', aria: { label: `Rank ${entry.rank}: ${entry.name} from ${entry.country}, ${entry.points} points` } }, [
      createElement('span', { class: `eco-leaderboard__rank ${rankClass}` }, [`#${entry.rank}`]),
      createElement('div', {}, [
        createElement('span', { style: 'font-weight: var(--weight-semibold);' }, [`${entry.country} ${entry.name}`]),
        createElement('span', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-left: var(--space-2);' }, [`${entry.carbonSaved}kg CO₂`])
      ]),
      createElement('span', { class: 'gradient-text', style: 'font-weight: var(--weight-bold);' }, [entry.points.toLocaleString()])
    ]);
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

        // Visual feedback
        card.style.transform = 'scale(0.95)';
        card.style.borderColor = 'rgba(105, 240, 174, 0.5)';
        setTimeout(() => {
          card.style.transform = '';
          card.style.borderColor = '';
        }, 300);

        // Update UI explicitly for points
        const pointsDisplay = document.getElementById('eco-points-display');
        if (pointsDisplay) pointsDisplay.textContent = userPoints;
        const carbonDisplay = document.getElementById('eco-carbon-display');
        if (carbonDisplay) replaceChildren(carbonDisplay, [carbonSaved.toFixed(1), createElement('span', { style: 'font-size: var(--text-sm); -webkit-text-fill-color: var(--color-text-muted);' }, ['kg'])]);
        const treeDisplay = document.getElementById('eco-trees-display');
        if (treeDisplay) treeDisplay.textContent = `🌳 ${Math.round(carbonSaved / 22)}`;

        const achievementsGrid = document.getElementById('eco-achievements-grid');
        if (achievementsGrid && newlyEarned.length > 0) {
            replaceChildren(achievementsGrid, achievements.map((a) => renderAchievement(a)));
        }

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
