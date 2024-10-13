import { cache } from "@solidjs/router";
import { listRecords } from "./db";

export const getRecords = cache(listRecords, 'getRecords');
