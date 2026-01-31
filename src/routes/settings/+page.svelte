<script lang="ts">
	import { onMount } from 'svelte';
	import { getPreferences, savePreferences, suitEmoji } from '$lib/services/krouter';
	import type { UserPreferences, Suit } from '$lib/types';

	let prefs = $state<UserPreferences>({
		suits: { hearts: 3, spades: 3, diamonds: 3, clubs: 3 },
		surpriseMe: true,
		watched: [],
		liked: [],
		blocked: []
	});

	const suitInfo: { suit: Suit; name: string; description: string; color: string }[] = [
		{ suit: 'hearts', name: 'Hearts', description: 'Emotional, connection, feels', color: '#ff6b6b' },
		{ suit: 'spades', name: 'Spades', description: 'Educational, analysis, news', color: '#4ecdc4' },
		{ suit: 'diamonds', name: 'Diamonds', description: 'Practical, how-to, builds', color: '#ffe66d' },
		{ suit: 'clubs', name: 'Clubs', description: 'Hype, motivation, action', color: '#95e1a3' }
	];

	onMount(() => {
		prefs = getPreferences();
	});

	function handleSliderChange(suit: Suit, value: number) {
		prefs.suits[suit] = value;
		savePreferences(prefs);
	}

	function toggleSurprise() {
		prefs.surpriseMe = !prefs.surpriseMe;
		savePreferences(prefs);
	}

	function clearHistory() {
		prefs.watched = [];
		prefs.liked = [];
		savePreferences(prefs);
	}

	function resetToDefaults() {
		prefs = {
			suits: { hearts: 3, spades: 3, diamonds: 3, clubs: 3 },
			surpriseMe: true,
			watched: [],
			liked: [],
			blocked: []
		};
		savePreferences(prefs);
	}
</script>

<svelte:head>
	<title>Settings — dTikTok</title>
</svelte:head>

<div class="settings-page">
	<header>
		<a href="/" class="back-btn" aria-label="Back to feed">
			<svg viewBox="0 0 24 24" fill="white" width="24" height="24">
				<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
			</svg>
		</a>
		<h1>Settings</h1>
	</header>

	<main>
		<!-- K-Routing Section -->
		<section>
			<h2>Your Algorithm</h2>
			<p class="section-desc">Adjust how much of each type you want in your feed.</p>

			<div class="sliders">
				{#each suitInfo as { suit, name, description, color }}
					<div class="slider-row">
						<div class="slider-header">
							<span class="suit-icon" style="color: {color}">{suitEmoji(suit)}</span>
							<div class="slider-label">
								<span class="suit-name">{name}</span>
								<span class="suit-desc">{description}</span>
							</div>
							<span class="slider-value">{prefs.suits[suit]}</span>
						</div>
						<input
							type="range"
							min="0"
							max="5"
							value={prefs.suits[suit]}
							oninput={(e) => handleSliderChange(suit, parseInt(e.currentTarget.value))}
							class="slider"
							style="--suit-color: {color}"
						/>
						<div class="slider-labels">
							<span>None</span>
							<span>Max</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Surprise Toggle -->
		<section>
			<div class="toggle-row" onclick={toggleSurprise}>
				<div>
					<h3>Surprise Me</h3>
					<p>Add some randomness to your feed</p>
				</div>
				<button class="toggle" class:active={prefs.surpriseMe} aria-label="Toggle surprise mode">
					<span class="toggle-thumb"></span>
				</button>
			</div>
		</section>

		<!-- Stats -->
		<section>
			<h2>Stats</h2>
			<div class="stats-grid">
				<div class="stat">
					<span class="stat-value">{prefs.watched.length}</span>
					<span class="stat-label">Watched</span>
				</div>
				<div class="stat">
					<span class="stat-value">{prefs.liked.length}</span>
					<span class="stat-label">Liked</span>
				</div>
				<div class="stat">
					<span class="stat-value">{prefs.blocked.length}</span>
					<span class="stat-label">Blocked</span>
				</div>
			</div>
		</section>

		<!-- Actions -->
		<section>
			<h2>Data</h2>
			<div class="actions">
				<button class="action-btn" onclick={clearHistory}>
					Clear Watch History
				</button>
				<button class="action-btn danger" onclick={resetToDefaults}>
					Reset All Settings
				</button>
			</div>
		</section>

		<!-- About -->
		<section class="about">
			<h2>About dTikTok</h2>
			<p>Your algorithm. Your data. Your feed.</p>
			<p class="small">
				Videos from Archive.org public domain collection.
				No tracking. No ads. No corporate control.
			</p>
			<div class="suit-legend">
				{#each suitInfo as { suit, name, color }}
					<span style="color: {color}">{suitEmoji(suit)} {name}</span>
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	.settings-page {
		min-height: 100vh;
		background: #000;
		color: white;
		padding-bottom: 40px;
	}

	header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		border-bottom: 1px solid #222;
		position: sticky;
		top: 0;
		background: #000;
		z-index: 10;
	}

	.back-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #222;
	}

	h1 {
		font-size: 20px;
		font-weight: 600;
		margin: 0;
	}

	main {
		padding: 16px;
		max-width: 500px;
		margin: 0 auto;
	}

	section {
		margin-bottom: 32px;
	}

	h2 {
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: #888;
		margin: 0 0 8px 0;
	}

	h3 {
		font-size: 16px;
		margin: 0;
	}

	.section-desc {
		color: #666;
		font-size: 14px;
		margin: 0 0 16px 0;
	}

	.sliders {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.slider-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.slider-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.suit-icon {
		font-size: 24px;
	}

	.slider-label {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.suit-name {
		font-weight: 600;
	}

	.suit-desc {
		font-size: 12px;
		color: #888;
	}

	.slider-value {
		font-size: 20px;
		font-weight: 700;
		width: 30px;
		text-align: right;
	}

	.slider {
		width: 100%;
		height: 8px;
		-webkit-appearance: none;
		appearance: none;
		background: #333;
		border-radius: 4px;
		outline: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--suit-color);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--suit-color);
		cursor: pointer;
		border: none;
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: #555;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		background: #111;
		border-radius: 12px;
		cursor: pointer;
	}

	.toggle-row p {
		margin: 4px 0 0 0;
		font-size: 14px;
		color: #888;
	}

	.toggle {
		width: 52px;
		height: 32px;
		background: #333;
		border-radius: 16px;
		border: none;
		position: relative;
		cursor: pointer;
		transition: background 0.2s;
	}

	.toggle.active {
		background: #ff2d55;
	}

	.toggle-thumb {
		position: absolute;
		top: 4px;
		left: 4px;
		width: 24px;
		height: 24px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.toggle.active .toggle-thumb {
		transform: translateX(20px);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.stat {
		background: #111;
		padding: 16px;
		border-radius: 12px;
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 24px;
		font-weight: 700;
	}

	.stat-label {
		font-size: 12px;
		color: #888;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.action-btn {
		background: #222;
		color: white;
		border: none;
		padding: 16px;
		border-radius: 12px;
		font-size: 16px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.action-btn:hover {
		background: #333;
	}

	.action-btn.danger {
		color: #ff6b6b;
	}

	.about {
		text-align: center;
		padding-top: 24px;
		border-top: 1px solid #222;
	}

	.about p {
		color: #888;
		margin: 8px 0;
	}

	.about .small {
		font-size: 12px;
		color: #555;
	}

	.suit-legend {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-top: 16px;
		font-size: 14px;
	}
</style>
