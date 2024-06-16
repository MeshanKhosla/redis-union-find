import { Redis } from "@upstash/redis";

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

  constructor(config: { redis_url: string; redis_token: string }) {
    this.redis = new Redis({
      url: config.redis_url,
      token: config.redis_token,
      enableAutoPipelining: true,
    });
  }

  private async findRoot(node: string): Promise<string> {
    let curNode = node;

    while (true) {
      const parent = await this.redis.hget<string>(curNode, "parent");
      if (parent == null) {
        throw new Error(`No parent found for ${curNode}`);
      }
      if (parent === curNode) {
        break;
      }

      curNode = parent;
    }

    return curNode;
  }

  /**
   * Connects the two nodes together
   */
  public async connect(nodeOne: string, nodeTwo: string) {
    // If either node is not in Redis yet, add it
    const addNodesScript = `
			local nodeOne = redis.call("HGETALL", KEYS[1])
			local nodeTwo = redis.call("HGETALL", KEYS[2])

			if #nodeOne == 0 then
				redis.call("HSET", KEYS[1], "parent", KEYS[1])
				redis.call("HSET", KEYS[1], "size", 1)
			end

			if #nodeTwo == 0 then
				redis.call("HSET", KEYS[2], "parent", KEYS[2])
				redis.call("HSET", KEYS[2], "size", 1)
			end
		`;

    await this.redis.eval(addNodesScript, [nodeOne, nodeTwo], []);
  }

  /**
   * Returns whether the two nodes are connected
   */
  public async isConnected(nodeOne: string, nodeTwo: string): Promise<boolean> {
    const [nodeOneRoot, nodeTwoRoot] = await Promise.all([
      this.findRoot(nodeOne),
      this.findRoot(nodeTwo),
    ]);

    return nodeOneRoot === nodeTwoRoot;
  }

  /**
   * Returns all nodes added to the disjoint set
   */
  public async getNodes(): Promise<string[]> {
    return [];
  }

  /**
   * Removes all nodes from the disjoint set
   */
  public async clear() {}
}
