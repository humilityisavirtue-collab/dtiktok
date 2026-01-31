import type { Video, Suit, UserPreferences } from '$lib/types';

const DEFAULT_PREFERENCES: UserPreferences = {
	suits: {
		hearts: 3,
		spades: 3,
		diamonds: 3,
		clubs: 3
	},
	surpriseMe: true,
	watched: [],
	liked: [],
	blocked: []
};

export function getPreferences(): UserPreferences {
	if (typeof localStorage === 'undefined') return DEFAULT_PREFERENCES;

	const saved = localStorage.getItem('dtiktok_preferences');
	if (saved) {
		try {
			return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
		} catch {
			return DEFAULT_PREFERENCES;
		}
	}
	return DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('dtiktok_preferences', JSON.stringify(prefs));
}

export function routeVideos(videos: Video[], prefs: UserPreferences): Video[] {
	// Filter out blocked and already watched (unless surpriseMe is off and we're low on content)
	let filtered = videos.filter(v =>
		!prefs.blocked.includes(v.id) &&
		(prefs.surpriseMe || !prefs.watched.includes(v.id))
	);

	// Calculate weights based on suit preferences
	const totalWeight = Object.values(prefs.suits).reduce((a, b) => a + b, 0);

	if (totalWeight === 0) {
		// If all suits are 0, just shuffle
		return shuffle(filtered);
	}

	// Score each video
	const scored = filtered.map(video => {
		const suitWeight = prefs.suits[video.suit] / totalWeight;
		const likedBonus = prefs.liked.includes(video.id) ? 0.2 : 0;
		const randomFactor = prefs.surpriseMe ? Math.random() * 0.3 : 0;

		return {
			video,
			score: suitWeight + likedBonus + randomFactor
		};
	});

	// Sort by score descending
	scored.sort((a, b) => b.score - a.score);

	return scored.map(s => s.video);
}

export function markWatched(videoId: string): void {
	const prefs = getPreferences();
	if (!prefs.watched.includes(videoId)) {
		prefs.watched.push(videoId);
		// Keep only last 500 watched
		if (prefs.watched.length > 500) {
			prefs.watched = prefs.watched.slice(-500);
		}
		savePreferences(prefs);
	}
}

export function toggleLike(videoId: string): boolean {
	const prefs = getPreferences();
	const index = prefs.liked.indexOf(videoId);

	if (index === -1) {
		prefs.liked.push(videoId);
		savePreferences(prefs);
		return true;
	} else {
		prefs.liked.splice(index, 1);
		savePreferences(prefs);
		return false;
	}
}

export function isLiked(videoId: string): boolean {
	const prefs = getPreferences();
	return prefs.liked.includes(videoId);
}

export function blockVideo(videoId: string): void {
	const prefs = getPreferences();
	if (!prefs.blocked.includes(videoId)) {
		prefs.blocked.push(videoId);
		savePreferences(prefs);
	}
}

function shuffle<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// Get suit emoji
export function suitEmoji(suit: Suit): string {
	const emojis: Record<Suit, string> = {
		hearts: '♥',
		spades: '♠',
		diamonds: '♦',
		clubs: '♣'
	};
	return emojis[suit];
}

// Get suit color class
export function suitColor(suit: Suit): string {
	return `suit-${suit}`;
}
