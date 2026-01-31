import type { Video, ArchiveItem, Suit } from '$lib/types';

const ARCHIVE_SEARCH_URL = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA_URL = 'https://archive.org/metadata';
const ARCHIVE_DOWNLOAD_URL = 'https://archive.org/download';

// Pre-curated collections with their default suits
const COLLECTIONS: { query: string; defaultSuit: Suit; name: string }[] = [
	{ query: 'collection:classic_cartoons', defaultSuit: 'hearts', name: 'Classic Cartoons' },
	{ query: 'collection:prelinger', defaultSuit: 'spades', name: 'Prelinger Archives' },
	{ query: 'collection:nasa', defaultSuit: 'diamonds', name: 'NASA' },
	{ query: 'subject:animation AND mediatype:movies', defaultSuit: 'clubs', name: 'Animation' },
	{ query: 'collection:stock_footage', defaultSuit: 'diamonds', name: 'Stock Footage' },
];

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
					suit: collection.defaultSuit,
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
		suit: collection.defaultSuit,
		tags: [],
		createdAt: new Date().toISOString()
	};
}
