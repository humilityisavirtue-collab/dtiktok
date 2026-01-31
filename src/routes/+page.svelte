<script lang="ts">
	import { onMount } from 'svelte';
	import type { Video } from '$lib/types';
	import VideoFeed from '$lib/components/VideoFeed.svelte';
	import { getBootstrapVideos, getRandomVideo } from '$lib/services/archive';
	import { routeVideos, getPreferences } from '$lib/services/krouter';

	let videos = $state<Video[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			// Get a quick first video while loading the rest
			const firstVideo = await getRandomVideo();
			if (firstVideo) {
				videos = [firstVideo];
				loading = false;
			}

			// Load more videos in background
			const bootstrapVideos = await getBootstrapVideos(30);
			const prefs = getPreferences();
			const routed = routeVideos(bootstrapVideos, prefs);

			// Merge, avoiding duplicates
			const existingIds = new Set(videos.map(v => v.id));
			const newVideos = routed.filter(v => !existingIds.has(v.id));
			videos = [...videos, ...newVideos];

		} catch (e) {
			console.error('Failed to load videos:', e);
			error = 'Failed to load videos. Please try again.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>dTikTok — Your algorithm. Your feed.</title>
	<meta name="description" content="Distributed TikTok with K-routed algorithm. Your data. Your control." />
</svelte:head>

{#if loading && videos.length === 0}
	<div class="loading-screen">
		<div class="loader"></div>
		<p>Loading the vault...</p>
	</div>
{:else if error}
	<div class="error-screen">
		<p>{error}</p>
		<button onclick={() => location.reload()}>Retry</button>
	</div>
{:else if videos.length > 0}
	<VideoFeed {videos} />

	<!-- Settings button -->
	<a href="/settings" class="settings-btn">
		<svg viewBox="0 0 24 24" fill="white" width="24" height="24">
			<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
		</svg>
	</a>
{:else}
	<div class="empty-screen">
		<p>No videos found</p>
		<button onclick={() => location.reload()}>Retry</button>
	</div>
{/if}

<style>
	.loading-screen, .error-screen, .empty-screen {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #000;
		color: white;
		gap: 16px;
	}

	.loader {
		width: 40px;
		height: 40px;
		border: 3px solid #333;
		border-top-color: #ff2d55;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	button {
		background: #ff2d55;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 16px;
		cursor: pointer;
	}

	.settings-btn {
		position: fixed;
		top: 16px;
		left: 16px;
		background: rgba(0,0,0,0.5);
		border-radius: 50%;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}
</style>
