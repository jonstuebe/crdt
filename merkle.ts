import { createHash } from "crypto";
import MerkleTree from "merkletreejs";

export const hash = (data: any) =>
  createHash("sha256").update(JSON.stringify(data)).digest();

export const createLeaf = (data: any) => hash(data);
export const createLeaves = (data: any[]) => data.map(createLeaf);

export const hasLatestChanges = (rootA: string, rootB: string) =>
  rootA === rootB;

export const bufferToString = (buffer: Buffer) => buffer.toString("hex");

export const getRootValue = (tree: MerkleTree) =>
  bufferToString(tree.getRoot());

export const createTree = (data: any[]) =>
  new MerkleTree(createLeaves(data), hash);

export const addChanges = (tree: MerkleTree, data: any[]) => {
  tree.addLeaves(createLeaves(data));
};

export const addChange = (tree: MerkleTree, data: any) => {
  tree.addLeaf(createLeaf(data));
};

export function getMissingLeaves(
  clientTree: MerkleTree,
  serverTree: MerkleTree
): string[] {
  const clientRootValue = getRootValue(clientTree);
  const serverRootValue = getRootValue(serverTree);

  if (hasLatestChanges(clientRootValue, serverRootValue)) {
    return [];
  }

  const clientLeaves = clientTree.getLeaves().map(bufferToString);
  const serverLeaves = serverTree.getLeaves().map(bufferToString);

  //  get all leaves that are in client but not in server
  const missingLeaves = clientLeaves.filter((v) => !serverLeaves.includes(v));

  return missingLeaves;
}
