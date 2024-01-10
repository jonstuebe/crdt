import MerkleTree from "merkletreejs";
import { HLC } from "./hlc";
import { bufferToString, getMissingLeaves, hash } from "./merkle";

export type Message = UpdateMessage | CreateMessage | DeleteMessage;

export interface BaseMessage {
  timestamp: string;
  version: number;
  entity: string;
  id: string;
}

export interface UpdateMessage extends BaseMessage {
  type: "update";
  field: string;
  value: any;
}

export interface CreateMessage extends BaseMessage {
  type: "create";
  values: Record<string, unknown>;
}

export interface DeleteMessage extends BaseMessage {
  type: "delete";
  field: string;
}

function update(
  data: Omit<UpdateMessage, "type" | "timestamp">,
  hlcTimestamp: string
): UpdateMessage {
  return {
    ...data,
    type: "update",
    timestamp: hlcTimestamp,
  };
}

function create(
  data: Omit<CreateMessage, "type" | "timestamp">,
  hlcTimestamp: string
): CreateMessage {
  return {
    ...data,
    type: "create",
    timestamp: hlcTimestamp,
  };
}

function del(
  data: Omit<DeleteMessage, "type" | "timestamp">,
  hlcTimestamp: string
): DeleteMessage {
  return {
    ...data,
    type: "delete",
    timestamp: hlcTimestamp,
  };
}

export const mutate = {
  create,
  update,
  delete: del,
};

export function sortMessages(messages: Message[]): Message[] {
  return messages.slice().sort((a, b) => {
    const aHlc = HLC.decode(a.timestamp);
    const bHlc = HLC.decode(b.timestamp);

    // sorted by hlc timestamp first
    if (aHlc.timestamp > bHlc.timestamp) {
      return 1;
    } else if (aHlc.timestamp < bHlc.timestamp) {
      return -1;
    }

    // then by hlc counter
    if (aHlc.counter > bHlc.counter) {
      return 1;
    } else if (aHlc.counter < bHlc.counter) {
      return -1;
    }

    // then by hlc nodeId
    if (aHlc.nodeId > bHlc.nodeId) {
      return 1;
    } else if (aHlc.nodeId < bHlc.nodeId) {
      return -1;
    }

    return 0;
  });
}

export function getUndeliveredMessages(
  clientTree: MerkleTree,
  serverTree: MerkleTree,
  messages: Message[]
) {
  const undeliveredHashes = getMissingLeaves(clientTree, serverTree);

  return messages.filter((update) =>
    undeliveredHashes.includes(bufferToString(hash(update)))
  );
}
