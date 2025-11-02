/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as cron from "../cron.js";
import type * as drawings from "../drawings.js";
import type * as files from "../files.js";
import type * as folders from "../folders.js";
import type * as notes from "../notes.js";
import type * as publicShare from "../publicShare.js";
import type * as sharedNotes from "../sharedNotes.js";
import type * as tags from "../tags.js";
import type * as trash from "../trash.js";
import type * as types_audit from "../types/audit.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cron: typeof cron;
  drawings: typeof drawings;
  files: typeof files;
  folders: typeof folders;
  notes: typeof notes;
  publicShare: typeof publicShare;
  sharedNotes: typeof sharedNotes;
  tags: typeof tags;
  trash: typeof trash;
  "types/audit": typeof types_audit;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
