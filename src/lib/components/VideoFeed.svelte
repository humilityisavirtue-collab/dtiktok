<script lang="ts">
	import type { Video } from '$lib/types';
	import VideoPlayer from './VideoPlayer.svelte';
	import { markWatched } from '$lib/services/krouter';

	interface Props {
		videos: Video[];
		onNearEnd?: () => void;
	}

	let { videos, onNearEnd }: Props = $props();

	let currentIndex = $state(0);
	let loadMoreTriggered = false;
	let containerEl: HTMLDivElement;

	// Touch handling for swipe
	let touchStartY = 0;
	let touchDeltaY = $state(0);
	let isSwiping = false;

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
		isSwiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isSwiping) return;
		touchDeltaY = e.touches[0].clientY - touchStartY;
	}

	function handleTouchEnd() {
		if (!isSwiping) return;
		isSwiping = false;

		const threshold = 50;

		if (touchDeltaY < -threshold && currentIndex < videos.length - 1) {
			// Swipe up - next video
			currentIndex++;
			markWatched(videos[currentIndex].id);
			checkNearEnd();
		} else if (touchDeltaY > threshold && currentIndex > 0) {
			// Swipe down - previous video
			currentIndex--;
		}

		touchDeltaY = 0;
	}

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === ' ') {
			e.preventDefault();
			if (currentIndex < videos.length - 1) {
				currentIndex++;
				markWatched(videos[currentIndex].id);
				checkNearEnd();
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (currentIndex > 0) {
				currentIndex--;
			}
		}
	}

	// Mouse wheel for desktop
	let wheelTimeout: ReturnType<typeof setTimeout>;
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		clearTimeout(wheelTimeout);

		wheelTimeout = setTimeout(() => {
			if (e.deltaY > 0 && currentIndex < videos.length - 1) {
				currentIndex++;
				markWatched(videos[currentIndex].id);
				checkNearEnd();
			} else if (e.deltaY < 0 && currentIndex > 0) {
				currentIndex--;
			}
		}, 50);
	}

	// Check if we're near the end and need more videos
	function checkNearEnd() {
		if (!loadMoreTriggered && currentIndex >= videos.length - 5) {
			loadMoreTriggered = true;
			onNearEnd?.();
		}
	}

	// Reset trigger when new videos are added
	$effect(() => {
		if (videos.length > 0 && currentIndex < videos.length - 10) {
			loadMoreTriggered = false;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="feed-container"
	bind:this={containerEl}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onwheel={handleWheel}
	role="application"
	tabindex="0"
>
	<div
		class="feed-track"
		style="transform: translateY(calc(-{currentIndex * 100}% + {touchDeltaY}px))"
	>
		{#each videos as video, index (video.id)}
			<div class="feed-item">
				<VideoPlayer {video} active={index === currentIndex} />
			</div>
		{/each}
	</div>

	<!-- Progress indicator -->
	<div class="progress">
		{currentIndex + 1} / {videos.length}
	</div>
</div>

<style>
	.feed-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		background: #000;
		outline: none;
	}

	.feed-track {
		height: 100%;
		transition: transform 0.3s ease-out;
	}

	.feed-item {
		height: 100vh;
		width: 100%;
	}

	.progress {
		position: fixed;
		top: 16px;
		right: 16px;
		background: rgba(0,0,0,0.5);
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		color: white;
		z-index: 100;
	}
</style>
