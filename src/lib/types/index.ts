export type Suit = 'hearts' | 'spades' | 'diamonds' | 'clubs';

export interface Video {
	id: string;
	source: 'archive' | 'ipfs' | 'upload';
	url: string;
	thumbnail?: string;
	title: string;
	description?: string;
	duration?: number;
	suit: Suit;
	tags: string[];
	creator?: string;
	createdAt: string;
}

export interface UserPreferences {
	suits: {
		hearts: number;   // 0-5
		spades: number;
		diamonds: number;
		clubs: number;
	};
	surpriseMe: boolean;
	watched: string[];
	liked: string[];
	blocked: string[];
}

export interface ArchiveItem {
	identifier: string;
	title: string;
	description?: string;
	mediatype: string;
	collection?: string[];
	subject?: string | string[];
}

export interface ArchiveFile {
	name: string;
	format: string;
	size?: string;
}
