<script lang="ts">
	import type { Video } from '$lib/types';
	import { suitEmoji, suitColor, toggleLike, isLiked } from '$lib/services/krouter';

	interface Props {
		video: Video;
		active: boolean;
	}

	let { video, active }: Props = $props();

	let videoEl: HTMLVideoElement;
	let paused = $state(false);
	let liked = $state(false);
	let showInfo = $state(true);

	$effect(() => {
		liked = isLiked(video.id);
	});

	$effect(() => {
		if (videoEl) {
			if (active && !paused) {
				videoEl.play().catch(() => {});
			} else {
				videoEl.pause();
			}
		}
	});

	function handleTap() {
		paused = !paused;
	}

	function handleDoubleTap() {
		liked = toggleLike(video.id);
	}

	function handleLike(e: Event) {
		e.stopPropagation();
		liked = toggleLike(video.id);
	}

	let lastTap = 0;
	function handleClick() {
		const now = Date.now();
		if (now - lastTap < 300) {
			handleDoubleTap();
		} else {
			handleTap();
		}
		lastTap = now;
	}

	function toggleInfo(e: Event) {
		e.stopPropagation();
		showInfo = !showInfo;
	}
</script>

<div class="video-container" onclick={handleClick}>
	<video
		bind:this={videoEl}
		src={video.url}
		loop
		muted
		playsinline
		preload="auto"
		class="video"
	>
		<track kind="captions" />
	</video>

	<!-- Pause indicator -->
	{#if paused}
		<div class="pause-indicator">
			<svg viewBox="0 0 24 24" fill="white" width="80" height="80">
				<path d="M8 5v14l11-7z"/>
			</svg>
		</div>
	{/if}

	<!-- Like animation -->
	{#if liked}
		<div class="like-indicator">♥</div>
	{/if}

	<!-- Video info overlay -->
	{#if showInfo}
		<div class="video-info">
			<div class="suit-badge {suitColor(video.suit)}">
				{suitEmoji(video.suit)} {video.suit}
			</div>
			<h3 class="title">{video.title}</h3>
			{#if video.description}
				<p class="description">{video.description.slice(0, 100)}{video.description.length > 100 ? '...' : ''}</p>
			{/if}
			<div class="source">via Archive.org</div>
		</div>
	{/if}

	<!-- Action buttons -->
	<div class="actions">
		<button class="action-btn" class:liked onclick={handleLike}>
			<svg viewBox="0 0 24 24" fill={liked ? '#ff6b6b' : 'white'} width="32" height="32">
				<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
			</svg>
		</button>
		<button class="action-btn" onclick={toggleInfo}>
			<svg viewBox="0 0 24 24" fill="white" width="32" height="32">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
			</svg>
		</button>
	</div>
</div>

<style>
	.video-container {
		position: relative;
		width: 100%;
		height: 100%;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.pause-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		opacity: 0.7;
		pointer-events: none;
	}

	.like-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 100px;
		color: #ff6b6b;
		animation: likeAnim 0.5s ease-out;
		pointer-events: none;
	}

	@keyframes likeAnim {
		0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
		50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
		100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
	}

	.video-info {
		position: absolute;
		bottom: 80px;
		left: 16px;
		right: 80px;
		color: white;
		text-shadow: 0 1px 3px rgba(0,0,0,0.8);
	}

	.suit-badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: 8px;
		background: rgba(0,0,0,0.5);
	}

	.title {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 4px 0;
		line-height: 1.3;
	}

	.description {
		font-size: 14px;
		margin: 0 0 4px 0;
		opacity: 0.9;
		line-height: 1.4;
	}

	.source {
		font-size: 12px;
		opacity: 0.6;
	}

	.actions {
		position: absolute;
		right: 12px;
		bottom: 100px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.action-btn {
		background: rgba(0,0,0,0.3);
		border: none;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.action-btn:active {
		transform: scale(0.9);
	}

	.action-btn.liked {
		animation: pop 0.3s ease;
	}

	@keyframes pop {
		50% { transform: scale(1.3); }
	}
</style>
