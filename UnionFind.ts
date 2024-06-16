import type { Redis } from "@upstash/redis";

/**
 * UnionFind implementation, WeightedQuickUnion with Path Compression
 * 
 * const wqu = new UnionFind();
 * 
 * wqu.connect("Alice", "Bob");
 * wqu.connect("Dave", "Eve");
 * wqu.isConnected("Alice", "Bob"); -> true
 * wqu.isConnected("Alice", "Eve"); -> false
 * wqu.connect("Alice", "Eve");
 * wqu.isConnected("Alice", "Eve"); -> true
 */
export class UnionFind {
	private redis: Redis;

	constructor(config: { redis: Redis }) {
		this.redis = config.redis
	}

	/**
	 * Connects the two nodes together
	 */
	public async connect(nodeOne: string, nodeTwo: string) {

	}

	/**
	 * Returns whether the two nodes are connected 
	 */
	public async isConnected(nodeOne: string, nodeTwo: string) : Promise<boolean> {
		return true;
	}

	/**
	 * Returns all nodes added to the disjoint set 
	 */
	public async getNodes() : Promise<string[]> {
		return []
	}

	/** 
	 * Removes all nodes from the disjoint set
	 */
	public async clear() {

	}

}