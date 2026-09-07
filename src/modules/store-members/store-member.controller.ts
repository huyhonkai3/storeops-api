import type { Request, Response } from "express";
import {
  addStoreMember,
  getStoreMembers,
  removeStoreMember,
  updateStoreMemberRole,
} from "../store-members/store-member.service.js";

import {
  AddStoreMemberInput,
  UpdateStoreMemberRoleInput,
} from "./store-member.type.js";
import { endsWith } from "zod";

export const addMember = async (
  req: Request<{ storeId: string }, {}, AddStoreMemberInput>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const member = await addStoreMember(storeId, req.body);
  res.status(201).json(member);
};

export const getMembers = async (
  req: Request<{ storeId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const members = await getStoreMembers(storeId);
  res.status(200).json({ data: members });
};

export const removeMember = async (
  req: Request<{ storeId: string; userId: string }>,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const userId = Number(req.params.userId);
  await removeStoreMember(storeId, userId);
  res.status(204).end();
};

export const editMemberRole = async (
  req: Request<
    { storeId: string; userId: string },
    {},
    UpdateStoreMemberRoleInput
  >,
  res: Response,
): Promise<void> => {
  const storeId = Number(req.params.storeId);
  const userId = Number(req.params.userId);
  const member = await updateStoreMemberRole(storeId, userId, req.body);
  res.status(200).json(member);
};
