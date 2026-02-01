import type { Video, ArchiveItem, Suit } from '$lib/types';

const ARCHIVE_SEARCH_URL = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA_URL = 'https://archive.org/metadata';
const ARCHIVE_DOWNLOAD_URL = 'https://archive.org/download';

// Pre-curated collections with their default suits
const COLLECTIONS: { query: string; defaultSuit: Suit; name: string }[] = [
	// Hearts - Emotional, connection, feels
	{ query: 'collection:classic_cartoons', defaultSuit: 'hearts', name: 'Classic Cartoons' },
	{ query: 'collection:classic_tv', defaultSuit: 'hearts', name: 'Classic TV' },
	{ query: 'subject:family AND mediatype:movies', defaultSuit: 'hearts', name: 'Family Films' },
	{ query: 'collection:feature_films', defaultSuit: 'hearts', name: 'Feature Films' },

	// Spades - Educational, analysis, news
	{ query: 'collection:prelinger', defaultSuit: 'spades', name: 'Prelinger Archives' },
	{ query: 'collection:educationalfilms', defaultSuit: 'spades', name: 'Educational Films' },
	{ query: 'collection:opensource_movies', defaultSuit: 'spades', name: 'Open Source Movies' },
	{ query: 'subject:documentary AND mediatype:movies', defaultSuit: 'spades', name: 'Documentaries' },

	// Diamonds - Practical, how-to, builds
	{ query: 'collection:nasa', defaultSuit: 'diamonds', name: 'NASA' },
	{ query: 'collection:stock_footage', defaultSuit: 'diamonds', name: 'Stock Footage' },
	{ query: 'subject:"how to" AND mediatype:movies', defaultSuit: 'diamonds', name: 'How-To' },
	{ query: 'collection:computersandtechvideos', defaultSuit: 'diamonds', name: 'Tech Videos' },

	// Clubs - Hype, motivation, action
	{ query: 'subject:animation AND mediatype:movies', defaultSuit: 'clubs', name: 'Animation' },
	{ query: 'subject:sports AND mediatype:movies', defaultSuit: 'clubs', name: 'Sports' },
	{ query: 'collection:short_films', defaultSuit: 'clubs', name: 'Short Films' },
	{ query: 'subject:music AND mediatype:movies', defaultSuit: 'clubs', name: 'Music Videos' },
];

// Keyword-based suit detection for smarter categorization
const SUIT_KEYWORDS: Record<Suit, string[]> = {
	hearts: ['love', 'family', 'friend', 'heart', 'romance', 'emotion', 'feel', 'cute', 'sweet', 'together', 'care', 'hug'],
	spades: ['learn', 'education', 'science', 'history', 'news', 'analysis', 'research', 'study', 'fact', 'explain', 'understand', 'think'],
	diamonds: ['how', 'build', 'make', 'craft', 'tutorial', 'guide', 'diy', 'cook', 'repair', 'create', 'practical', 'step'],
	clubs: ['action', 'energy', 'power', 'fast', 'wild', 'hype', 'fight', 'race', 'sport', 'dance', 'music', 'party', 'adventure']
};

function detectSuit(item: ArchiveItem, defaultSuit: Suit): Suit {
	const text = `${item.title || ''} ${item.description || ''} ${Array.isArray(item.subject) ? item.subject.join(' ') : item.subject || ''}`.toLowerCase();

	const scores: Record<Suit, number> = { hearts: 0, spades: 0, diamonds: 0, clubs: 0 };

	for (const [suit, keywords] of Object.entries(SUIT_KEYWORDS)) {
		for (const keyword of keywords) {
			if (text.includes(keyword)) {
				scores[suit as Suit]++;
			}
		}
	}

	// Find highest scoring suit
	let maxScore = 0;
	let detectedSuit = defaultSuit;
	for (const [suit, score] of Object.entries(scores)) {
		if (score > maxScore) {
			maxScore = score;
			detectedSuit = suit as Suit;
		}
	}

	// Only override if we have a strong signal (2+ keyword matches)
	return maxScore >= 2 ? detectedSuit : defaultSuit;
}

export async function searchArchive(query: string, rows = 20): Promise<ArchiveItem[]> {
	const params = new URLSearchParams({
		q: `${query} AND mediatype:movies`,
		fl: 'identifier,title,description,mediatype,collection,subject',
		rows: String(rows),
		output: 'json',
		sort: 'downloads desc'
	});

	try {
		const response = await fetch(`${ARCHIVE_SEARCH_URL}?${params}`);
		const data = await response.json();
		return data.response?.docs || [];
	} catch (error) {
		console.error('Archive search failed:', error);
		return [];
	}
}

export async function getVideoFiles(identifier: string): Promise<string[]> {
	try {
		const response = await fetch(`${ARCHIVE_METADATA_URL}/${identifier}`);
		const data = await response.json();

		const videoFiles = data.files?.filter((f: { format: string; name: string }) =>
			f.format === 'MPEG4' ||
			f.format === 'h.264' ||
			f.name.endsWith('.mp4') ||
			f.name.endsWith('.ogv')
		) || [];

		// Prefer MP4, smaller files first for mobile
		const sorted = videoFiles.sort((a: { size?: string }, b: { size?: string }) => {
			const sizeA = parseInt(a.size || '0');
			const sizeB = parseInt(b.size || '0');
			return sizeA - sizeB;
		});

		return sorted.map((f: { name: string }) =>
			`${ARCHIVE_DOWNLOAD_URL}/${identifier}/${encodeURIComponent(f.name)}`
		);
	} catch (error) {
		console.error('Failed to get video files:', error);
		return [];
	}
}

export async function getBootstrapVideos(count = 50): Promise<Video[]> {
	const videos: Video[] = [];
	const perCollection = Math.ceil(count / COLLECTIONS.length);

	for (const collection of COLLECTIONS) {
		const items = await searchArchive(collection.query, perCollection);

		for (const item of items) {
			const urls = await getVideoFiles(item.identifier);
			if (urls.length > 0) {
				videos.push({
					id: item.identifier,
					source: 'archive',
					url: urls[0],
					title: item.title || 'Untitled',
					description: item.description,
					suit: detectSuit(item, collection.defaultSuit),
					tags: Array.isArray(item.subject) ? item.subject : item.subject ? [item.subject] : [],
					createdAt: new Date().toISOString()
				});
			}
		}
	}

	return videos;
}

// Quick fetch of a single random video for immediate display
export async function getRandomVideo(): Promise<Video | null> {
	const collection = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];
	const items = await searchArchive(collection.query, 10);

	if (items.length === 0) return null;

	const item = items[Math.floor(Math.random() * items.length)];
	const urls = await getVideoFiles(item.identifier);

	if (urls.length === 0) return null;

	return {
		id: item.identifier,
		source: 'archive',
		url: urls[0],
		title: item.title || 'Untitled',
		description: item.description,
		suit: detectSuit(item, collection.defaultSuit),
		tags: Array.isArray(item.subject) ? item.subject : item.subject ? [item.subject] : [],
		createdAt: new Date().toISOString()
	};
}
