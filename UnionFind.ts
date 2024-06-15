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
	/**
	 * Connects the two nodes together
	 */
	public connect(nodeOne: string, nodeTwo: string) {

	}

	/**
	 * Returns whether the two nodes are connected 
	 */
	public isConnected(nodeOne: string, nodeTwo: string) : boolean {
		return true;
	}

	/**
	 * Returns all nodes added to the disjoint set 
	 */
	public getNodes() : string[] {
		return []
	}

	/** 
	 * Removes all nodes from the disjoint set
	 */
	public clear() {

	}

}